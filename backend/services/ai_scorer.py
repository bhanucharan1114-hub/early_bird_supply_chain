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

    prompt = f"""<ROLE>
You are an elite, highly-paid Supply Chain Risk Intelligence Analyst for a Fortune 500 company.
</ROLE>

<CONTEXT>
We are monitoring real-time global news to assess logistics and production risks for materials sourced from {country}. 
</CONTEXT>

<TASK>
Evaluate the provided news headlines and determine the aggregate supply chain disruption risk. Assign a unified risk score from 0 to 100 based on the severity of the threat.
</TASK>

<SCORING_GUIDE>
- 0-15  : Benign / No supply chain relevance
- 16-35 : Minor concern (Worth monitoring, but no immediate impact)
- 36-55 : Moderate risk (Could cause localized delays)
- 56-75 : Significant risk (Disruption highly likely, alternate sourcing recommended)
- 76-100: Severe crisis (Immediate and catastrophic disruption, action required immediately)
</SCORING_GUIDE>

<HEADLINES>
{headlines_text}
</HEADLINES>

<OUTPUT_FORMAT>
You must respond with ONLY a valid JSON object matching this strict schema:
{{
  "risk_score": <integer between 0 and 100>,
  "reason": "<string, maximum 8 words explaining the primary driver of the score>"
}}
</OUTPUT_FORMAT>"""

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
                "response_format": {"type": "json_object"},
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

    prompt = f"""<ROLE>
You are an expert Commodity Supply Chain Risk Analyst.
</ROLE>

<CONTEXT>
We are monitoring live news for shortages, price shocks, and supply chain disruptions affecting {material}.
</CONTEXT>

<TASK>
Analyze the following headlines and determine the current global supply chain risk level for this specific material.
</TASK>

<HEADLINES>
{headlines_text}
</HEADLINES>

<OUTPUT_FORMAT>
You must respond with ONLY a valid JSON object matching this strict schema:
{{
  "risk_score": <integer between 0 and 100, where 0 is no risk and 100 is a critical global crisis/shortage>
}}
</OUTPUT_FORMAT>"""

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
                "response_format": {"type": "json_object"},
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
