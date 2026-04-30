import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uvicorn

# Load backend/.env (TAVILY_API_KEY, GROQ_API_KEY, etc.)
load_dotenv()

# Database setup
from database import engine, get_db
import models
import schemas

# Core signal services
from services.weather_service import get_weather_risk
from services.commodity_service import get_commodity_stress
from services.news_service import get_geopolitical_risk

# Enrichment services (Tavily + Groq AI)
from services.tavily_service import (
    get_port_disruption_signals,
    get_material_shortage_signals,
)
from services.ai_scorer import ai_score_headlines, ai_score_material_context

# Create DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Supply Chain Early Bird API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# SIGNAL REQUEST MODEL
# ============================================================================

class SignalRequest(BaseModel):
    suppliers: list[str]
    materials: list[str]
    company_name: str | None = None
    routes: list[str] | None = None


# ============================================================================
# /api/signals — main intelligence endpoint
# ============================================================================

@app.post("/api/signals")
def fetch_all_signals(req: SignalRequest):
    """
    Fetch and merge all supply chain signals in parallel:

    Tier 1 (core data):
      - GNews geopolitical risk per supplier country
      - Open-Meteo weather risk per supplier country
      - Yahoo Finance commodity stress per material

    Tier 2 (enrichment — runs concurrently with Tier 1):
      - Tavily web search: port/shipping disruption signals per country
      - Tavily web search: material shortage signals per material

    Tier 3 (AI scoring):
      - Groq llama-3.1-8b-instant: scores Tavily headlines for each country
      - Groq llama-3.1-8b-instant: scores Tavily headlines for each material

    Merger logic:
      Geo risk score   = min(100, GNews_score + 0.5 * Tavily_boost + 0.3 * AI_score)
      Commodity risk   = min(100, yfinance_score + 0.4 * Tavily_boost + 0.3 * AI_score)
    """

    # ── Run all Tier 1 + Tier 2 services in parallel ──────────────────────
    with ThreadPoolExecutor(max_workers=5) as ex:
        f_geo       = ex.submit(get_geopolitical_risk, req.suppliers)
        f_weather   = ex.submit(get_weather_risk, req.suppliers)
        f_commodity = ex.submit(get_commodity_stress, req.materials)
        f_ports     = ex.submit(get_port_disruption_signals, req.suppliers, req.company_name, req.routes)
        f_materials = ex.submit(get_material_shortage_signals, req.materials)

    geo_data       = _safe(f_geo, [])
    weather_data   = _safe(f_weather, [])
    commodity_data = _safe(f_commodity, [])
    port_signals   = _safe(f_ports, {})
    material_signals = _safe(f_materials, {})

    # ── Tier 3: AI score Tavily headlines in parallel ──────────────────────
    ai_geo_scores  = {}
    ai_mat_scores  = {}

    with ThreadPoolExecutor(max_workers=8) as ex:
        # Score port headlines per country
        geo_futures = {
            ex.submit(
                ai_score_headlines,
                country,
                port_signals.get(country, {}).get("headlines", []),
            ): country
            for country in req.suppliers
        }
        # Score material headlines per material
        mat_futures = {
            ex.submit(
                ai_score_material_context,
                material,
                material_signals.get(material, {}).get("headlines", []),
            ): material
            for material in req.materials
        }

        for f in as_completed({**geo_futures, **mat_futures}):
            key = geo_futures.get(f) or mat_futures.get(f)
            try:
                score = f.result()
                if key in req.suppliers:
                    ai_geo_scores[key] = score
                else:
                    ai_mat_scores[key] = score
            except Exception as e:
                print(f"AI scoring error for {key}: {e}")

    # ── Merge Tier 2 + Tier 3 into Tier 1 results ─────────────────────────
    enriched_geo = []
    for item in geo_data:
        country = item["country"]
        tavily_boost = port_signals.get(country, {}).get("riskBoost", 0)
        ai_score     = ai_geo_scores.get(country, 0)
        tavily_headlines = port_signals.get(country, {}).get("headlines", [])

        base = item.get("riskScore", 0) or 0
        merged_score = min(100, int(base + 0.5 * tavily_boost + 0.3 * ai_score))

        enriched_geo.append({
            **item,
            "riskScore": merged_score,
            "tavilyBoost": tavily_boost,
            "aiScore": ai_score,
            "webHeadlines": tavily_headlines,
            # Combined headlines for the frontend to display
            "sampleHeadlines": (
                item.get("sampleHeadlines", []) + tavily_headlines
            )[:3],
        })

    enriched_commodity = []
    for item in commodity_data:
        material = item["material"]
        tavily_boost = material_signals.get(material, {}).get("riskBoost", 0)
        ai_score     = ai_mat_scores.get(material, 0)
        tavily_headlines = material_signals.get(material, {}).get("headlines", [])

        base = item.get("riskScore", 0) or 0
        merged_score = min(100, int(base + 0.4 * tavily_boost + 0.3 * ai_score))

        enriched_commodity.append({
            **item,
            "riskScore": merged_score,
            "tavilyBoost": tavily_boost,
            "aiScore": ai_score,
            "webHeadlines": tavily_headlines,
        })

    return {
        "geopoliticalRisk": enriched_geo,
        "weatherRisk": weather_data,
        "commodityStress": enriched_commodity,
        "meta": {
            "tavilyEnriched": bool(os.getenv("TAVILY_API_KEY")),
            "aiScored": bool(os.getenv("GROQ_API_KEY")),
        },
    }


def _safe(future, default):
    """Return future result or default on exception."""
    try:
        return future.result()
    except Exception as e:
        print(f"Service error: {e}")
        return default


# ============================================================================
# DATABASE ENDPOINTS
# ============================================================================

@app.post("/api/users/{user_id}/savedAnalyses", response_model=schemas.AnalysisResponse)
def save_analysis(user_id: str, analysis: schemas.AnalysisCreate, db: Session = Depends(get_db)):
    db_analysis = models.SavedAnalysis(
        user_id=user_id,
        company_name=analysis.companyName,
        product_name=analysis.productName,
        risk_score=analysis.riskScore,
        risk_level=analysis.riskLevel,
        components=analysis.components,
        signals=analysis.signals,
        recommendations=analysis.recommendations,
        anomalies=analysis.anomalies,
        trend=analysis.trend,
        summary=analysis.summary,
        incident=analysis.incident,
        follow_up=analysis.followUp,
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return {**analysis.model_dump(), "id": db_analysis.id}


@app.get("/api/users/{user_id}/savedAnalyses")
def get_analyses(user_id: str, db: Session = Depends(get_db)):
    analyses = (
        db.query(models.SavedAnalysis)
        .filter(models.SavedAnalysis.user_id == user_id)
        .order_by(models.SavedAnalysis.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "companyName": a.company_name,
            "productName": a.product_name,
            "riskScore": a.risk_score,
            "riskLevel": a.risk_level,
            "components": a.components,
            "signals": a.signals,
            "summary": a.summary,
            "incident": a.incident,
            "followUp": a.follow_up,
            "recommendations": a.recommendations,
            "anomalies": a.anomalies,
            "trend": a.trend,
            "createdAt": a.created_at.isoformat(),
        }
        for a in analyses
    ]


@app.delete("/api/users/{user_id}/savedAnalyses/{analysis_id}")
def delete_analysis(user_id: str, analysis_id: int, db: Session = Depends(get_db)):
    db_analysis = (
        db.query(models.SavedAnalysis)
        .filter(
            models.SavedAnalysis.id == analysis_id,
            models.SavedAnalysis.user_id == user_id,
        )
        .first()
    )
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(db_analysis)
    db.commit()
    return {"success": True}


@app.post("/api/users/{user_id}/customCompanies")
def save_company(user_id: str, company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = models.CustomCompany(
        user_id=user_id,
        name=company.name,
        category=company.category,
        description=company.description,
        products=company.products,
        suppliers=company.suppliers,
        routes=company.routes,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return {**company.model_dump(), "id": db_company.id}


@app.get("/api/users/{user_id}/customCompanies")
def get_companies(user_id: str, db: Session = Depends(get_db)):
    companies = (
        db.query(models.CustomCompany)
        .filter(models.CustomCompany.user_id == user_id)
        .order_by(models.CustomCompany.created_at.desc())
        .all()
    )
    return [
        {
            "id": c.id,
            "name": c.name,
            "category": c.category,
            "description": c.description,
            "products": c.products,
            "suppliers": c.suppliers,
            "routes": c.routes,
        }
        for c in companies
    ]


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Supply Chain Early Bird API v2 — Tavily + Groq AI Enhanced",
        "enrichment": {
            "tavily": bool(os.getenv("TAVILY_API_KEY")),
            "groq_ai_scoring": bool(os.getenv("GROQ_API_KEY")),
        },
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
