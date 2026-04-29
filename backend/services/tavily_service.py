"""
Tavily Search Service — Real-time Web Intelligence

Provides two functions:
  get_port_disruption_signals(countries)  → risk boost per country from shipping news
  get_material_shortage_signals(materials) → risk boost per material from supply news

Results are merged into geo/commodity risk scores in main.py to enrich the
keyword-matched and yfinance signals with live web-search context.
"""

import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
TAVILY_URL = "https://api.tavily.com/search"

# Keywords that indicate real supply chain disruption
HIGH_DISRUPTION = [
    "port closure", "factory fire", "strike action", "plant shutdown",
    "export ban", "seized", "blockade", "catastrophic", "force majeure",
]
MEDIUM_DISRUPTION = [
    "delay", "disruption", "backlog", "shortage", "congestion",
    "tariff", "sanction", "embargo", "protest", "unrest",
]


def _search(query: str, max_results: int = 5) -> list[dict]:
    """Single Tavily search. Returns [] on any failure."""
    if not TAVILY_API_KEY:
        return []
    try:
        resp = requests.post(
            TAVILY_URL,
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "max_results": max_results,
                "search_depth": "basic",
            },
            timeout=12,
        )
        if resp.ok:
            return resp.json().get("results", [])
    except Exception as e:
        print(f"Tavily search failed ({query[:40]}…): {e}")
    return []


def _score_results(results: list[dict]) -> tuple[int, list[str]]:
    """
    Score a list of Tavily results for disruption severity.
    Returns (risk_boost 0-60, notable_headlines[]).
    """
    risk_boost = 0
    headlines = []
    for r in results:
        text = ((r.get("title") or "") + " " + (r.get("content") or "")).lower()
        if any(kw in text for kw in HIGH_DISRUPTION):
            risk_boost += 25
            headlines.append(r.get("title", ""))
        elif any(kw in text for kw in MEDIUM_DISRUPTION):
            risk_boost += 12
            headlines.append(r.get("title", ""))
    return min(60, risk_boost), headlines[:3]


def get_port_disruption_signals(countries: list[str]) -> dict[str, dict]:
    """
    Parallel Tavily searches for port/shipping/logistics disruptions.
    Returns { country: { riskBoost: int, headlines: list[str] } }
    """
    def _search_country(country: str):
        results = _search(
            f"{country} port shipping logistics disruption delay strike 2025",
            max_results=4,
        )
        boost, headlines = _score_results(results)
        return country, {"riskBoost": boost, "headlines": headlines}

    output = {}
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(_search_country, c): c for c in countries}
        for f in as_completed(futures):
            try:
                country, data = f.result()
                output[country] = data
            except Exception as e:
                print(f"Port signal failed: {e}")
    return output


def get_material_shortage_signals(materials: list[str]) -> dict[str, dict]:
    """
    Parallel Tavily searches for material supply shortages and price spikes.
    Returns { material: { riskBoost: int, headlines: list[str] } }
    """
    def _search_material(material: str):
        results = _search(
            f"{material} supply shortage scarcity price spike 2025",
            max_results=4,
        )
        boost, headlines = _score_results(results)
        return material, {"riskBoost": boost, "headlines": headlines}

    output = {}
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(_search_material, m): m for m in materials}
        for f in as_completed(futures):
            try:
                material, data = f.result()
                output[material] = data
            except Exception as e:
                print(f"Material signal failed: {e}")
    return output
