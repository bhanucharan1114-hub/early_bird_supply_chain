/**
 * Signal Fetchers
 *
 * fetchAllSignals: Tries Python backend first (GNews + Open-Meteo + Yahoo Finance),
 * then falls back to direct third-party API calls from the browser.
 *
 * Each fetcher returns normalised risk scores (0-100).
 */

import { fetchSignalsFromBackend } from "./api.js";
import { searchGeopoliticalFallback } from "./tavily-search.js";

// ============================================================================
// AGGREGATOR — backend-first, direct-API fallback
// ============================================================================

export async function fetchAllSignals(company, product) {
  const suppliers = company.suppliers.map((s) => s.country);
  const materials = product.criticalMaterials;

  // --- Try Python backend first (server-side APIs, no CORS issues) ---
  try {
    const companyName = company.name;
    const routes = (company.routes || []).map(r => `${r.origin} to ${r.destination}`);
    
    const backendData = await fetchSignalsFromBackend(suppliers, materials, companyName, routes);
    if (backendData) {
      // Normalise backend field names so risk-engine.js gets what it expects.
      // Backend: { geopoliticalRisk, weatherRisk, commodityStress }
      // risk-engine detectAnomalies expects: trendChange on geo, volatility on commodity
      const geoRisk = (backendData.geopoliticalRisk || []).map((g) => ({
        ...g,
        articleCount: g.riskyArticleCount ?? 0,
        riskyArticleCount: g.riskyArticleCount ?? 0,
        trendChange: 0, // backend heuristic doesn't compute trend yet
        keywordMatches: 0,
      }));

      const weatherRisk = (backendData.weatherRisk || []).map((w) => ({
        ...w,
        condition: w.condition ?? "Unknown",
        capital: w.country,
      }));

      const commodityStress = (backendData.commodityStress || []).map((c) => ({
        ...c,
        priceChange: c.priceChange ?? 0,
        volatility: Math.abs(c.priceChange ?? 0) * 2, // derive volatility proxy
        currentPrice: c.currentPrice ?? null,
        previousPrice: null,
      }));

      return {
        timestamp: new Date().toISOString(),
        company: company.name,
        product: product.name,
        geopoliticalRisk: geoRisk,
        weatherRisk,
        commodityStress,
        source: "backend",
      };
    }
  } catch (err) {
    console.warn("Backend signals unavailable, using direct APIs:", err.message);
  }

  // --- Fallback: call third-party APIs directly from the browser ---
  const [geoRisk, weatherRisk, commodityStress] = await Promise.all([
    fetchGeopoliticalRisk(suppliers),
    fetchWeatherRisk(suppliers),
    fetchCommodityStress(materials),
  ]);

  return {
    timestamp: new Date().toISOString(),
    company: company.name,
    product: product.name,
    geopoliticalRisk: geoRisk,
    weatherRisk,
    commodityStress,
    source: "direct",
  };
}

// ============================================================================
// 1. GEOPOLITICAL NEWS FETCHER (NewsAPI) — browser fallback
// ============================================================================

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2";

const GEOPOLITICAL_KEYWORDS = [
  "war", "conflict", "sanctions", "embargo", "tariff",
  "port strike", "blockade", "protest", "unrest",
  "trade ban", "customs delay", "border closure",
  "supply chain", "disruption", "export control",
];

export async function fetchGeopoliticalRisk(countries) {
  const results = [];

  for (const country of countries) {
    try {
      const query = `${country} (${GEOPOLITICAL_KEYWORDS.slice(0, 3).join(" OR ")})`;
      const response = await fetch(
        `${NEWS_API_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      const articles = data.articles || [];
      const riskyArticles = articles.filter((a) =>
        GEOPOLITICAL_KEYWORDS.some(
          (kw) =>
            a.title.toLowerCase().includes(kw) ||
            a.description?.toLowerCase().includes(kw)
        )
      );

      const keywordMatches = articles.reduce((sum, a) => {
        const titleMatches = GEOPOLITICAL_KEYWORDS.filter((kw) =>
          a.title.toLowerCase().includes(kw)
        ).length;
        const descMatches = GEOPOLITICAL_KEYWORDS.filter((kw) =>
          a.description?.toLowerCase().includes(kw)
        ).length;
        return sum + titleMatches + descMatches;
      }, 0);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentArticles = articles.filter(
        (a) => new Date(a.publishedAt) > sevenDaysAgo
      ).length;
      const oldArticles = articles.filter(
        (a) => new Date(a.publishedAt) <= sevenDaysAgo
      ).length;
      const trend =
        oldArticles > 0 ? ((recentArticles - oldArticles) / oldArticles) * 100 : 0;

      const riskScore = Math.min(
        100,
        (riskyArticles.length / Math.max(articles.length, 1)) * 100 +
          Math.min(20, trend / 5)
      );

      results.push({
        country,
        riskScore: Math.round(riskScore),
        articleCount: articles.length,
        riskyArticleCount: riskyArticles.length,
        keywordMatches: Math.round(keywordMatches),
        trendChange: Math.round(trend),
        sampleHeadlines: riskyArticles.slice(0, 2).map((a) => a.title),
      });
    } catch (error) {
      console.warn(`NewsAPI failed for ${country}, trying Tavily fallback...`);
      try {
        const fallback = await searchGeopoliticalFallback(country);
        if (fallback.riskScore !== null) {
          results.push({ country, ...fallback, trendChange: 0, keywordMatches: 0 });
          continue;
        }
      } catch { /* Tavily also failed */ }
      results.push({ country, riskScore: 25, error: error.message, trendChange: 0 });
    }
  }

  return results;
}

// ============================================================================
// 2. WEATHER RISK FETCHER (OpenWeatherMap) — browser fallback
// ============================================================================

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

const WEATHER_RISK_EVENTS = {
  thunderstorm: 90, tornado: 100, hurricane: 100, cyclone: 100,
  drizzle: 10, rain: 40, snow: 35, mist: 5, smoke: 20, haze: 15,
  dust: 30, fog: 20, sand: 40, ash: 50, squall: 70, cloud: 0, clear: 0,
};

export async function fetchWeatherRisk(countries) {
  const COUNTRY_COORDS = {
    China: { lat: 39.9075, lon: 116.40747, capital: "Beijing" },
    Taiwan: { lat: 25.0330, lon: 121.5654, capital: "Taipei" },
    "South Korea": { lat: 37.5665, lon: 126.9780, capital: "Seoul" },
    Vietnam: { lat: 21.0285, lon: 105.8542, capital: "Hanoi" },
    Malaysia: { lat: 3.1390, lon: 101.6869, capital: "Kuala Lumpur" },
    India: { lat: 28.6139, lon: 77.2090, capital: "Delhi" },
    Germany: { lat: 52.5200, lon: 13.4050, capital: "Berlin" },
    Australia: { lat: -33.8688, lon: 151.2093, capital: "Sydney" },
    Chile: { lat: -33.4489, lon: -70.6693, capital: "Santiago" },
    Ireland: { lat: 53.3498, lon: -6.2603, capital: "Dublin" },
    Singapore: { lat: 1.3521, lon: 103.8198, capital: "Singapore" },
    USA: { lat: 38.8951, lon: -77.0369, capital: "Washington DC" },
  };

  const results = [];

  for (const country of countries) {
    try {
      const coords = COUNTRY_COORDS[country];
      if (!coords) {
        results.push({ country, riskScore: 20, error: "Country coords not found", trendChange: 0 });
        continue;
      }

      const response = await fetch(
        `${WEATHER_API_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();

      const condition = data.weather[0].main.toLowerCase();
      const temperature = Math.round(data.main.temp);
      const feelsLike = Math.round(data.main.feels_like);

      let riskScore = WEATHER_RISK_EVENTS[condition] || 20;
      if (temperature > 45) riskScore += 30;
      if (temperature < -20) riskScore += 25;
      if (data.wind.speed > 15) riskScore += 20;
      if (data.rain || data.snow) riskScore += 15;
      riskScore = Math.min(100, riskScore);

      results.push({
        country,
        capital: coords.capital,
        riskScore: Math.round(riskScore),
        condition,
        temperature,
        feelsLike,
        windSpeed: Math.round(data.wind.speed),
        humidity: data.main.humidity,
        trendChange: 0,
      });
    } catch (error) {
      console.warn(`Failed to fetch weather data for ${country}:`, error);
      results.push({ country, riskScore: 20, error: error.message, trendChange: 0 });
    }
  }

  return results;
}

// ============================================================================
// 3. COMMODITY PRICE FETCHER (Alpha Vantage) — browser fallback
// ============================================================================

const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";

export async function fetchCommodityStress(materials) {
  const results = [];

  for (const material of materials) {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_URL}?function=FX_DAILY&from_symbol=USD&to_symbol=EUR&apikey=${ALPHA_VANTAGE_KEY}`
      );

      if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
      await response.json(); // consume the response

      // Simulation until a paid commodity API endpoint is configured
      const currentPrice = Math.random() * 100 + 50;
      const previousPrice = currentPrice * (0.9 + Math.random() * 0.2);
      const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
      const volatility = Math.abs(priceChange) * 2;
      const riskScore = Math.min(100, volatility + Math.max(0, priceChange) * 1.5);

      results.push({
        material,
        currentPrice: Math.round(currentPrice * 100) / 100,
        previousPrice: Math.round(previousPrice * 100) / 100,
        priceChange: Math.round(priceChange * 100) / 100,
        volatility: Math.round(volatility),
        riskScore: Math.round(riskScore),
      });
    } catch (error) {
      console.warn(`Failed to fetch commodity data for ${material}:`, error);
      results.push({ material, riskScore: 30, priceChange: 0, volatility: 0, error: error.message });
    }
  }

  return results;
}
