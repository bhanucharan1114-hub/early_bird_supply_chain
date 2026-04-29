/**
 * Company Profiles — Helper Functions
 *
 * Static company data has been removed. Companies are now created by users
 * and persisted via the Python backend (SQLite).
 *
 * calculateDependencyRisk is still used by risk-engine.js.
 */

/**
 * Calculate dependency risk from a suppliers array.
 * Based on supplier concentration and geographic diversity.
 * @param {Array} suppliers - Array of { country, weight }
 * @returns {number} 0-100 risk score
 */
export function calculateDependencyRisk(suppliers) {
  if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
    return 50;
  }

  const supplierCount = suppliers.length;
  const maxWeight = Math.max(...suppliers.map((s) => s.weight || 0));

  let riskScore = 0;

  // Concentration: fewer suppliers = higher risk
  if (supplierCount <= 2) riskScore += 40;
  else if (supplierCount <= 4) riskScore += 20;

  // Dominant supplier risk
  if (maxWeight > 0.5) riskScore += 30;
  else if (maxWeight > 0.3) riskScore += 15;

  // Geographic concentration risk
  const uniqueCountries = new Set(suppliers.map((s) => s.country)).size;
  if (uniqueCountries === 1) riskScore += 30;
  else if (uniqueCountries === 2) riskScore += 15;

  return Math.min(riskScore, 100);
}
