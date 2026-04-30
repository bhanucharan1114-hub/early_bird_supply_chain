const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ANALYTICS_KEY = import.meta.env.VITE_GROQ_ANALYTICS_KEY || GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================

/**
 * Generate an AI executive summary via Groq.
 * Formats signals as clean bullet points to minimise token waste.
 */
export async function generateExecutiveSummary(riskScore, signals, company, product) {
  // Format geopolitical signals cleanly (no raw JSON)
  const geoLines = (signals.geopoliticalRisk || [])
    .filter((g) => g.riskScore !== null)
    .map((g) => `  • ${g.country}: risk ${g.riskScore}/100${g.sampleHeadlines?.[0] ? ` — "${g.sampleHeadlines[0]}"` : ""}`)
    .join("\n");

  const weatherLines = (signals.weatherRisk || [])
    .filter((w) => w.riskScore !== null)
    .map((w) => `  • ${w.country}: risk ${w.riskScore}/100, ${w.condition ?? "unknown"}, ${w.temperature != null ? w.temperature + "°C" : ""}`)
    .join("\n");

  const commodityLines = (signals.commodityStress || [])
    .filter((c) => c.riskScore !== null)
    .map((c) => `  • ${c.material}: risk ${c.riskScore}/100, price ${c.priceChange != null ? (c.priceChange > 0 ? "+" : "") + c.priceChange + "%" : "N/A"}`)
    .join("\n");

  const prompt = `<ROLE>
You are a senior supply chain risk analyst and executive advisor.
</ROLE>

<CONTEXT>
You are preparing an immediate intelligence briefing for the C-suite of ${company.name} regarding the production of their product: ${product.name}.
</CONTEXT>

<DATA_INPUTS>
Overall Risk Score: ${riskScore.finalScore}/100 (${_levelName(riskScore.finalScore)})

Risk Component Breakdown:
- Geopolitical Risk: ${riskScore.components.geopoliticalRisk}/100
- Weather Risk: ${riskScore.components.weatherRisk}/100
- Commodity Stress: ${riskScore.components.commodityStress}/100
- Supply Dependency: ${riskScore.components.dependencyRisk}/100

Key Geopolitical Signals:
${geoLines || "  • No major signals detected"}

Key Weather Signals:
${weatherLines || "  • No adverse weather detected"}

Key Commodity Signals:
${commodityLines || "  • No major commodity stress detected"}
</DATA_INPUTS>

<TASK>
Write a highly concise, 2-3 sentence executive summary of the current supply chain risk. 
</TASK>

<CONSTRAINTS>
1. Identify the top 1-2 risk drivers by name (e.g., specific countries or materials).
2. Explicitly state the potential business impact.
3. Be direct, authoritative, and highly specific. No generic or fluffy statements.
4. Do NOT use bullet points or lists in your summary text.
</CONSTRAINTS>

<OUTPUT_FORMAT>
You must respond with ONLY a valid JSON object matching this strict schema:
{
  "summary": "<string, 2-3 sentences max>"
}
</OUTPUT_FORMAT>`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 220,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    return parsed.summary || content;
  } catch (error) {
    console.warn("Groq summary failed:", error.message);
    return _fallbackSummary(riskScore, signals);
  }
}

function _levelName(score) {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

// ============================================================================
// TAB-SPECIFIC AI ANALYTICS
// ============================================================================

export async function generateTabAnalyses(signals, company, product) {
  // Format data safely
  const suppliers = company.suppliers || [];
  const materials = product.criticalMaterials || [];
  const routes = company.routes || [];

  const geoLines = (signals.geopoliticalRisk || [])
    .filter((g) => g.riskScore !== null)
    .map((g) => `  • ${g.country}: risk ${g.riskScore}/100`)
    .join("\n");

  const weatherLines = (signals.weatherRisk || [])
    .filter((w) => w.riskScore !== null)
    .map((w) => `  • ${w.country}: risk ${w.riskScore}/100, ${w.condition}, ${w.temperature}°C`)
    .join("\n");

  const commodityLines = (signals.commodityStress || [])
    .filter((c) => c.riskScore !== null)
    .map((c) => `  • ${c.material}: risk ${c.riskScore}/100`)
    .join("\n");

  const prompt = `<ROLE>
You are a senior supply chain risk analyst and executive advisor.
</ROLE>

<CONTEXT>
You are analyzing the specific operational logistics of ${company.name} for the production of ${product.name}.
</CONTEXT>

<DATA_INPUTS>
Suppliers & Dependencies:
${suppliers.map(s => `  • ${s.country} (${Math.round(s.weight * 100)}% dependency)`).join("\n") || "None"}

Logistics Routes:
${routes.map(r => `  • ${r.origin} to ${r.destination}`).join("\n") || "None"}

Critical Materials:
${materials.join(", ") || "None"}

Current Risk Signals in Supplier Regions:
Geopolitical:
${geoLines || "None"}
Weather:
${weatherLines || "None"}
Commodity:
${commodityLines || "None"}
</DATA_INPUTS>

<TASK>
Provide highly specific, contextual risk analysis for three distinct areas of the supply chain: Suppliers, Routes, and Materials.
</TASK>

<CONSTRAINTS>
1. Each analysis must be exactly 2 to 3 sentences long.
2. Be direct, authoritative, and specific to the data provided. Do not invent fake names or regions.
3. If no risks are detected for an area, state that operations are stable but note the inherent concentration dependencies.
</CONSTRAINTS>

<OUTPUT_FORMAT>
You must respond with ONLY a valid JSON object matching this strict schema:
{
  "suppliers_analysis": "<string>",
  "routes_analysis": "<string>",
  "materials_analysis": "<string>"
}
</OUTPUT_FORMAT>`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_ANALYTICS_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.warn("Groq tab analyses failed:", error.message);
    return {
      suppliers_analysis: "Unable to generate AI analysis. Review the supplier breakdown and signal data below.",
      routes_analysis: "Unable to generate AI analysis. Review the transit routes below.",
      materials_analysis: "Unable to generate AI analysis. Review the commodity data below.",
    };
  }
}

/**
 * Deterministic fallback — always produces a non-empty, specific message.
 */
function _fallbackSummary(riskScore, signals) {
  const { components } = riskScore;
  const level = _levelName(riskScore.finalScore);

  // Find the dominant risk driver
  const drivers = [
    { name: "geopolitical instability", score: components.geopoliticalRisk },
    { name: "weather disruptions", score: components.weatherRisk },
    { name: "commodity volatility", score: components.commodityStress },
    { name: "supply concentration", score: components.dependencyRisk },
  ].sort((a, b) => b.score - a.score);

  const topDriver = drivers[0];

  // Find the most at-risk country / material for specificity
  const topGeoCountry = (signals.geopoliticalRisk || [])
    .filter((r) => r.riskScore !== null)
    .sort((a, b) => b.riskScore - a.riskScore)[0]?.country;

  const topMaterial = (signals.commodityStress || [])
    .filter((r) => r.riskScore !== null)
    .sort((a, b) => b.riskScore - a.riskScore)[0]?.material;

  let detail = "";
  if (topDriver.name === "geopolitical instability" && topGeoCountry) {
    detail = ` Primary exposure is in ${topGeoCountry}.`;
  } else if (topDriver.name === "commodity volatility" && topMaterial) {
    detail = ` ${topMaterial} prices are the primary pressure point.`;
  }

  return `Overall supply chain risk is ${level} (${riskScore.finalScore}/100), driven primarily by ${topDriver.name} (${topDriver.score}/100).${detail} Review the signal breakdown and recommendations below for immediate actions.`;
}

// ============================================================================
// INCIDENT ANALYSIS
// ============================================================================

export async function analyzeIncident(signals, _company) {
  // Guard against empty arrays before Math.max
  const geoScores = (signals.geopoliticalRisk || [])
    .filter((r) => r.riskScore !== null)
    .map((r) => r.riskScore);
  const weatherScores = (signals.weatherRisk || [])
    .filter((r) => r.riskScore !== null)
    .map((r) => r.riskScore);
  const commodityScores = (signals.commodityStress || [])
    .filter((r) => r.riskScore !== null)
    .map((r) => r.riskScore);

  const geoMax = geoScores.length ? Math.max(...geoScores) : 0;
  const weatherMax = weatherScores.length ? Math.max(...weatherScores) : 0;
  const commodityMax = commodityScores.length ? Math.max(...commodityScores) : 0;

  let topIssue = null;

  if (geoMax >= weatherMax && geoMax >= commodityMax && geoMax > 45) {
    const geo = signals.geopoliticalRisk.find((r) => r.riskScore === geoMax);
    const headline = geo?.sampleHeadlines?.[0];
    topIssue = headline
      ? `Geopolitical alert in ${geo.country}: "${headline}"`
      : `Elevated geopolitical risk detected in ${geo?.country ?? "supplier region"}`;
  } else if (weatherMax >= commodityMax && weatherMax > 45) {
    const weather = signals.weatherRisk.find((r) => r.riskScore === weatherMax);
    topIssue = `${weather?.condition ?? "Adverse weather"} in ${weather?.country ?? "supplier region"} (${weather?.temperature != null ? weather.temperature + "°C" : ""}) — may impact transit`;
  } else if (commodityMax > 45) {
    const commodity = signals.commodityStress.find((r) => r.riskScore === commodityMax);
    const changeStr =
      commodity?.priceChange != null
        ? ` (${commodity.priceChange > 0 ? "+" : ""}${commodity.priceChange}%)`
        : "";
    topIssue = `${commodity?.material ?? "Key material"} price pressure${changeStr} — review procurement contracts`;
  }

  if (!topIssue) return null;

  return {
    topIssue,
    timestamp: new Date().toISOString(),
    affectedRegions: (signals.geopoliticalRisk || [])
      .filter((r) => r.riskScore !== null && r.riskScore > 45)
      .map((r) => r.country),
  };
}

// ============================================================================
// FOLLOW-UP QUESTIONS
// ============================================================================

export function suggestFollowUpQuestions(riskScore, company, product) {
  const questions = [];
  const { components } = riskScore;

  // Guard: get top supplier safely
  const topSupplier = company.suppliers?.[0]?.country ?? "primary supplier regions";
  const altSupplier = company.alternateSuppliers?.[0]?.country ?? "alternate suppliers";

  if (components.geopoliticalRisk > 65) {
    questions.push(
      `What trade agreements protect ${company.name}'s access to ${topSupplier}?`
    );
    questions.push(
      `Which qualified alternate suppliers could replace ${topSupplier} within 90 days?`
    );
  }

  if (components.weatherRisk > 55) {
    questions.push("Are alternate shipping routes currently available and at what cost premium?");
    questions.push(`What is our current ${product.name} inventory runway if inbound shipments are delayed by 2 weeks?`);
  }

  if (components.commodityStress > 55) {
    const topMaterial = (company.products?.[0]?.criticalMaterials ?? [])[0];
    questions.push(
      topMaterial
        ? `Do we have forward contracts or price locks for ${topMaterial}?`
        : "Do we have forward contracts or price locks for our critical materials?"
    );
    questions.push("What is our exposure to spot-market pricing on key inputs this quarter?");
  }

  if (components.dependencyRisk > 65) {
    questions.push(`Can we nearshore or dual-source ${product.name} production to reduce concentration risk?`);
    questions.push(
      `What is the cost premium for sourcing from ${altSupplier}?`
    );
  }

  return questions;
}

// ============================================================================
// RISK TREND
// ============================================================================

/**
 * Calculate risk trend vs historical scores.
 * Pass savedAnalyses sorted ascending by date to get accurate trend.
 */
export function calculateRiskTrend(currentRiskScore, historicalScores = []) {
  if (historicalScores.length === 0) {
    return { trend: "neutral", change: 0, direction: "→", percentChange: 0 };
  }

  const previousScore = historicalScores[historicalScores.length - 1];
  const change = currentRiskScore - previousScore;
  const percentChange =
    previousScore > 0 ? Math.round((change / previousScore) * 100) : 0;

  let trend = "stable";
  let direction = "→";

  if (change > 8) {
    trend = "worsening";
    direction = "↑";
  } else if (change < -8) {
    trend = "improving";
    direction = "↓";
  }

  return { trend, change: Math.abs(change), direction, percentChange };
}
