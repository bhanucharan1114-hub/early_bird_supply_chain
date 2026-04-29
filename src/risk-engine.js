/**
 * Risk Scoring Engine
 *
 * Logic-based risk calculator combining normalised signals into a
 * single risk score (0-100).
 *
 * Weighted formula:
 *   Geopolitical risk   35%   (political instability, wars, sanctions)
 *   Weather risk        25%   (shipping / production disruptions)
 *   Commodity stress    20%   (input cost pressure, price spikes)
 *   Dependency risk     20%   (supply concentration amplifies all others)
 */

import { calculateDependencyRisk } from "./data/company-profiles.js";

// ============================================================================
// SIGNAL NORMALIZERS (→ 0-100)
// ============================================================================

/**
 * Geopolitical: 70% worst-country score + 30% average.
 * The worst-case country dominates because a single critical supplier
 * going offline blocks the whole supply chain.
 */
function normalizeGeopoliticalRisk(geoRiskData) {
  if (!geoRiskData || geoRiskData.length === 0) return 0;

  const validScores = geoRiskData
    .filter((item) => item.riskScore !== null && item.riskScore !== undefined)
    .map((item) => item.riskScore);

  if (validScores.length === 0) return 0;

  const maxRisk = Math.max(...validScores);
  const avgRisk = validScores.reduce((a, b) => a + b, 0) / validScores.length;

  return Math.round(maxRisk * 0.7 + avgRisk * 0.3);
}

/**
 * Weather: weighted by supplier dependency.
 * A severe storm in a 60%-weight supplier counts more than the same
 * storm in a 10%-weight supplier. Falls back to simple average when
 * weights are unavailable.
 *
 * @param {Array} weatherRiskData  - weather signal objects
 * @param {Array} suppliers        - company.suppliers with { country, weight }
 */
function normalizeWeatherRisk(weatherRiskData, suppliers = []) {
  if (!weatherRiskData || weatherRiskData.length === 0) return 0;

  const validItems = weatherRiskData.filter(
    (item) => item.riskScore !== null && item.riskScore !== undefined
  );
  if (validItems.length === 0) return 0;

  // Build a weight map from supplier array
  const weightMap = {};
  let totalWeight = 0;
  for (const s of suppliers) {
    if (s.country && s.weight) {
      weightMap[s.country] = s.weight;
      totalWeight += s.weight;
    }
  }

  if (totalWeight > 0) {
    // Weighted average by supplier importance
    let weighted = 0;
    for (const item of validItems) {
      const w = weightMap[item.country] || 0.1; // small floor for unknown suppliers
      weighted += item.riskScore * w;
    }
    // Normalise by actual total weight of matched items
    const matchedWeight = validItems.reduce(
      (sum, item) => sum + (weightMap[item.country] || 0.1),
      0
    );
    return Math.round(weighted / matchedWeight);
  }

  // Fallback: 60% max + 40% average (worse than geo because weather affects
  // transit routes across all suppliers simultaneously)
  const scores = validItems.map((i) => i.riskScore);
  const max = Math.max(...scores);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(max * 0.6 + avg * 0.4);
}

/**
 * Commodity: 60% worst-material + 40% average.
 * A single critical material shortage can halt an entire production line.
 */
function normalizeCommodityStress(commodityData) {
  if (!commodityData || commodityData.length === 0) return 0;

  const validScores = commodityData
    .filter((item) => item.riskScore !== null && item.riskScore !== undefined)
    .map((item) => item.riskScore);

  if (validScores.length === 0) return 0;

  const maxStress = Math.max(...validScores);
  const avgStress = validScores.reduce((a, b) => a + b, 0) / validScores.length;

  return Math.round(maxStress * 0.6 + avgStress * 0.4);
}

// ============================================================================
// FINAL RISK SCORE
// ============================================================================

export function calculateRiskScore(signals, company) {
  const geoRisk = normalizeGeopoliticalRisk(signals.geopoliticalRisk);
  const weatherRisk = normalizeWeatherRisk(
    signals.weatherRisk,
    company.suppliers
  );
  const commodityStress = normalizeCommodityStress(signals.commodityStress);
  const dependencyRisk = calculateDependencyRisk(company.suppliers);

  // Adaptive weights: if a signal source returned all nulls, redistribute
  // its weight proportionally across the remaining signals so the score
  // is still meaningful.
  const rawWeights = { geo: 0.35, weather: 0.25, commodity: 0.20, dependency: 0.20 };

  const hasGeo = signals.geopoliticalRisk?.some((r) => r.riskScore !== null);
  const hasWeather = signals.weatherRisk?.some((r) => r.riskScore !== null);
  const hasCommodity = signals.commodityStress?.some((r) => r.riskScore !== null);

  // Zero out weight for any completely missing signal
  const activeWeights = {
    geo: hasGeo ? rawWeights.geo : 0,
    weather: hasWeather ? rawWeights.weather : 0,
    commodity: hasCommodity ? rawWeights.commodity : 0,
    dependency: rawWeights.dependency, // always available
  };

  const totalWeight = Object.values(activeWeights).reduce((a, b) => a + b, 0);

  const finalScore =
    totalWeight > 0
      ? (geoRisk * activeWeights.geo +
          weatherRisk * activeWeights.weather +
          commodityStress * activeWeights.commodity +
          dependencyRisk * activeWeights.dependency) /
        totalWeight
      : dependencyRisk;

  return {
    finalScore: Math.round(finalScore),
    components: {
      geopoliticalRisk: geoRisk,
      weatherRisk: weatherRisk,
      commodityStress: commodityStress,
      dependencyRisk: dependencyRisk,
    },
    weights: rawWeights,
    dataQuality: {
      hasGeopolitical: hasGeo,
      hasWeather: hasWeather,
      hasCommodity: hasCommodity,
    },
  };
}

// ============================================================================
// RISK LEVEL CLASSIFICATION
// ============================================================================

export function getRiskLevel(score) {
  if (score >= 81) return { level: "Critical", color: "#A32D2D", emoji: "🔴" };
  if (score >= 61) return { level: "High", color: "#BA7517", emoji: "🟠" };
  if (score >= 31) return { level: "Medium", color: "#854F0B", emoji: "🟡" };
  return { level: "Low", color: "#3B6D11", emoji: "🟢" };
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/**
 * Detect unusual patterns in signals.
 * Works with both backend data (no trendChange) and direct-API data.
 */
export function detectAnomalies(signals) {
  const anomalies = [];

  // --- Anomaly 1: Any single supplier country with very high geo risk ---
  const highGeoCountries = (signals.geopoliticalRisk || []).filter(
    (item) => item.riskScore !== null && item.riskScore >= 70
  );
  if (highGeoCountries.length > 0) {
    const names = highGeoCountries.map((c) => c.country).join(", ");
    anomalies.push({
      type: "geopolitical_spike",
      severity: highGeoCountries.some((c) => c.riskScore >= 85) ? "critical" : "high",
      description: `Elevated geopolitical risk detected in ${names}`,
      action: "Monitor supplier country developments and review contingency plans",
    });
  }

  // --- Anomaly 2: Extreme commodity volatility (from backend volatility5d OR priceChange) ---
  const volatileMaterials = (signals.commodityStress || []).filter((item) => {
    const vol = item.volatility5d ?? item.volatility ?? Math.abs(item.priceChange ?? 0) * 2;
    return vol > 6 || Math.abs(item.priceChange ?? 0) > 5;
  });
  if (volatileMaterials.length > 0) {
    const names = volatileMaterials.map((m) => m.material).join(", ");
    anomalies.push({
      type: "commodity_volatility",
      severity: "high",
      description: `Extreme price volatility in ${names}`,
      action: "Lock in forward contracts or increase strategic inventory immediately",
    });
  }

  // --- Anomaly 3: Severe weather hitting multiple suppliers at once ---
  const severeWeatherCount = (signals.weatherRisk || []).filter(
    (item) => item.riskScore !== null && item.riskScore >= 65
  ).length;
  if (severeWeatherCount >= 2) {
    anomalies.push({
      type: "multi_location_weather",
      severity: "critical",
      description: `Severe weather conditions across ${severeWeatherCount} supplier regions simultaneously`,
      action: "Activate alternative routes and pre-position safety stock immediately",
    });
  } else if (severeWeatherCount === 1) {
    const affected = signals.weatherRisk.find((i) => i.riskScore >= 65);
    anomalies.push({
      type: "single_location_weather",
      severity: "high",
      description: `Adverse weather in ${affected.country} (${affected.condition || "severe conditions"})`,
      action: "Assess shipping route impact and consider rerouting affected shipments",
    });
  }

  // --- Anomaly 4: Very high dependency (concentration) risk ---
  const depRisk = signals.geopoliticalRisk?.length === 0 ? null : null; // reserved
  void depRisk;

  return anomalies;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate specific, data-driven action recommendations.
 * Uses actual country/material names from signals for precision.
 */
export function generateRecommendations(riskScore, signals, company) {
  const recommendations = [];
  const { level } = getRiskLevel(riskScore.finalScore);
  const { components } = riskScore;

  // Collect the highest-risk geo countries for targeted advice
  const highRiskGeoCountries = (signals.geopoliticalRisk || [])
    .filter((r) => r.riskScore !== null && r.riskScore >= 60)
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((r) => r.country);

  // Collect high-volatility materials
  const highVolMaterials = (signals.commodityStress || [])
    .filter((r) => r.riskScore !== null && r.riskScore >= 60)
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((r) => r.material);

  // Worst weather country
  const worstWeather = (signals.weatherRisk || [])
    .filter((r) => r.riskScore !== null && r.riskScore >= 55)
    .sort((a, b) => b.riskScore - a.riskScore)[0];

  // --- Geopolitical recommendations ---
  if (components.geopoliticalRisk > 60) {
    const targetCountry = highRiskGeoCountries[0] || "high-risk regions";
    recommendations.push({
      category: "Geopolitical Risk",
      priority: components.geopoliticalRisk > 75 ? "high" : "medium",
      actions: [
        `Activate contingency plan for supply disruptions from ${targetCountry}`,
        "Monitor trade policy changes and engage embassy/consulate contacts",
        `Qualify backup suppliers outside ${targetCountry} immediately`,
        "Increase safety stock for components sourced from affected regions",
      ],
    });
  }

  // --- Weather recommendations ---
  if (components.weatherRisk > 55 && worstWeather) {
    recommendations.push({
      category: "Weather & Climate",
      priority: components.weatherRisk > 70 ? "high" : "medium",
      actions: [
        `${worstWeather.country} is experiencing ${worstWeather.condition || "adverse conditions"} — reroute affected shipments now`,
        "Negotiate flexible delivery windows with key customers",
        "Pre-position safety stock at unaffected distribution centers",
        "Review freight insurance coverage for weather-related delays",
      ],
    });
  }

  // --- Commodity recommendations ---
  if (components.commodityStress > 55 && highVolMaterials.length > 0) {
    const topMaterial = highVolMaterials[0];
    recommendations.push({
      category: "Commodity & Pricing",
      priority: components.commodityStress > 70 ? "high" : "medium",
      actions: [
        `Lock in forward contracts for ${topMaterial} at current prices before further increases`,
        `Audit ${topMaterial} inventory levels and increase buffer stock`,
        `Explore substitute materials or alternative suppliers for ${highVolMaterials.slice(0, 2).join(" and ")}`,
        "Negotiate long-term fixed-price contracts with primary material suppliers",
      ],
    });
  }

  // --- Dependency recommendations ---
  if (components.dependencyRisk > 65) {
    const topSupplier = (company.suppliers || [])[0];
    recommendations.push({
      category: "Supply Chain Diversification",
      priority: components.dependencyRisk > 80 ? "high" : "medium",
      actions: [
        topSupplier
          ? `Dual-source critical components to reduce over-reliance on ${topSupplier.country}`
          : "Dual-source critical components across multiple supplier countries",
        "Develop qualified alternate suppliers in at least one additional geography",
        "Nearshore or onshore high-risk components where cost-effective",
        "Build 60–90 day strategic inventory reserves for single-source materials",
      ],
    });
  }

  // --- Immediate escalation for Critical / High overall risk ---
  if (level === "Critical" || level === "High") {
    recommendations.push({
      category: "Immediate Actions",
      priority: "critical",
      actions: [
        "Convene emergency supply chain war-room with procurement, logistics and finance",
        "Audit all open purchase orders and in-transit shipments for exposure",
        "Issue early-warning communication to key customers about potential delays",
        "Activate the business continuity plan and establish daily status updates",
      ],
    });
  }

  return recommendations;
}
