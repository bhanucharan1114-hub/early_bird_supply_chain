/**
 * Tavily Search — Fallback & Enrichment
 *
 * Used when primary signal sources (NewsAPI, etc.) fail or return
 * insufficient data.
 */

const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const TAVILY_API_URL = "https://api.tavily.com/search";

/**
 * Generic Tavily search
 */
async function searchTavily(query, options = {}) {
  const { maxResults = 5, searchDepth = "basic", includeDomains = [] } = options;

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_domains: includeDomains.length ? includeDomains : undefined,
    }),
  });

  if (!response.ok) throw new Error(`Tavily API error: ${response.status}`);
  const data = await response.json();
  return data.results || [];
}

/**
 * Geopolitical fallback when NewsAPI fails.
 * Normalises Tavily results into the same shape as the NewsAPI fetcher.
 */
export async function searchGeopoliticalFallback(country) {
  try {
    const results = await searchTavily(
      `${country} trade sanctions embargo supply chain risk`,
      { maxResults: 5 }
    );

    const riskyKeywords = [
      "war", "conflict", "sanctions", "embargo", "tariff",
      "strike", "blockade", "protest", "disruption",
    ];

    const riskyCount = results.filter((r) =>
      riskyKeywords.some(
        (kw) =>
          r.title?.toLowerCase().includes(kw) ||
          r.content?.toLowerCase().includes(kw)
      )
    ).length;

    const riskScore = Math.min(
      100,
      (riskyCount / Math.max(results.length, 1)) * 100
    );

    return {
      riskScore: Math.round(riskScore),
      articleCount: results.length,
      riskyArticleCount: riskyCount,
      sampleHeadlines: results.slice(0, 2).map((r) => r.title),
      source: "tavily_fallback",
    };
  } catch (error) {
    console.warn("Tavily fallback failed:", error.message);
    return { riskScore: null };
  }
}
