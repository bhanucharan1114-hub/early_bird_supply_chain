from gnews import GNews

# Tiered keyword weights for risk scoring
HIGH_RISK_WORDS = [
    "war", "invasion", "airstrike", "explosion", "factory fire",
    "earthquake", "tsunami", "flood", "catastrophe",
]
MEDIUM_RISK_WORDS = [
    "sanction", "embargo", "tariff", "strike", "protest",
    "blockade", "ban", "restriction", "closure", "shutdown",
]
LOW_RISK_WORDS = [
    "disruption", "delay", "shortage", "tension", "risk",
    "supply chain", "logistics", "inflation", "slowdown",
]


def _score_headline(title: str) -> int:
    """Return a risk contribution for a single headline."""
    t = title.lower()
    if any(w in t for w in HIGH_RISK_WORDS):
        return 35
    if any(w in t for w in MEDIUM_RISK_WORDS):
        return 20
    if any(w in t for w in LOW_RISK_WORDS):
        return 8
    return 0  # neutral / irrelevant article → contributes nothing


def get_geopolitical_risk(countries: list[str]) -> list[dict]:
    """
    Fetch geopolitical risk for each supplier country.
    Uses a tiered keyword scoring model instead of a flat per-article bonus.
    Returns a list of risk objects, one per country.
    """
    google_news = GNews(language="en", country="US", period="7d", max_results=5)
    results = []

    for country in countries:
        query = (
            f'"{country}" AND ('
            '"supply chain" OR "strike" OR "sanctions" OR "embargo" '
            'OR "tariff" OR "disruption" OR "factory fire" OR "war" '
            'OR "protest" OR "blockade")'
        )

        try:
            news_items = google_news.get_news(query)

            base_risk = 10  # everyone starts at 10 (background noise)
            headlines = []
            risky_count = 0

            for item in news_items:
                title = item.get("title", "")
                headlines.append(title)
                score = _score_headline(title)
                if score > 0:
                    risky_count += 1
                base_risk += score

            # Cap and normalise
            risk_score = min(100, base_risk)

            results.append({
                "country": country,
                "riskScore": risk_score,
                "riskyArticleCount": risky_count,
                "totalArticles": len(news_items),
                "sampleHeadlines": (
                    [h for h in headlines if _score_headline(h) > 0][:2]
                    or (headlines[:2] if headlines else ["No major disruptions reported"])
                ),
            })

        except Exception as e:
            print(f"News fetch failed for {country}: {e}")
            results.append({
                "country": country,
                "riskScore": 25,
                "riskyArticleCount": 0,
                "totalArticles": 0,
                "sampleHeadlines": ["Data currently unavailable"],
            })

    return results
