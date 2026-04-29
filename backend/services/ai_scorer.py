"""
AI Scorer — Groq-powered headline batch scoring

Replaces keyword heuristics with an LLM judgment call.
Uses llama-3.1-8b-instant (fast, cheap) rather than the 70B model
so it can score every country without adding noticeable latency.

Returns a 0-100 risk score that blends with the keyword-based score.
"""

import os
import json
import requests

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def ai_score_headlines(country: str, headlines: list[str]) -> int:
    """
    Ask Groq to assess how disruptive these headlines are for a company
    sourcing from `country`. Returns 0-100 (or 0 if scoring fails).

    Uses llama-3.1-8b-instant for speed (avg latency ~400ms).
    """
    if not GROQ_API_KEY or not headlines:
        return 0

    headlines_text = "\n".join(f"- {h}" for h in headlines)

    prompt = f"""You are a supply chain risk analyst. Rate these news headlines for supply chain disruption risk for a company sourcing materials from {country}.

Headlines:
{headlines_text}

Reply with ONLY a JSON object, nothing else:
{{"risk_score": <integer 0-100>, "reason": "<max 8 words>"}}

Scoring guide:
0-15   = No supply chain relevance
16-35  = Minor concern, worth monitoring  
36-55  = Moderate — could cause delays
56-75  = Significant — disruption likely
76-100 = Severe — immediate action required"""

    try:
        resp = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.1-8b-instant",
                "max_tokens": 80,
                "temperature": 0.1,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=10,
        )
        if resp.ok:
            content = resp.json()["choices"][0]["message"]["content"].strip()
            # Extract JSON even if the model adds surrounding text
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end > start:
                data = json.loads(content[start:end])
                score = int(data.get("risk_score", 0))
                return max(0, min(100, score))
    except Exception as e:
        print(f"AI headline scoring failed for {country}: {e}")

    return 0


def ai_score_material_context(material: str, headlines: list[str]) -> int:
    """
    Ask Groq to assess commodity supply risk from Tavily headlines.
    Returns 0-100 risk score.
    """
    if not GROQ_API_KEY or not headlines:
        return 0

    headlines_text = "\n".join(f"- {h}" for h in headlines)

    prompt = f"""Rate these headlines for {material} supply chain / commodity risk.

Headlines:
{headlines_text}

Reply ONLY with JSON: {{"risk_score": <0-100>}}
(0=no risk, 100=critical shortage/crisis)"""

    try:
        resp = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.1-8b-instant",
                "max_tokens": 40,
                "temperature": 0.1,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=8,
        )
        if resp.ok:
            content = resp.json()["choices"][0]["message"]["content"].strip()
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end > start:
                data = json.loads(content[start:end])
                score = int(data.get("risk_score", 0))
                return max(0, min(100, score))
    except Exception as e:
        print(f"AI material scoring failed for {material}: {e}")

    return 0
