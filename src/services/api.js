const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

/**
 * Save a risk analysis to the Python SQLite database
 */
export async function saveAnalysis(userId, analysisData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/savedAnalyses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysisData),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to save analysis: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving analysis:", error.message);
    throw error;
  }
}

/**
 * Load all saved analyses for a user from the database
 */
export async function loadSavedAnalyses(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/savedAnalyses`);
    if (!response.ok) throw new Error("Failed to load analyses from backend");
    return await response.json();
  } catch (error) {
    console.error("Error loading analyses:", error.message);
    return [];
  }
}

/**
 * Delete a saved analysis
 */
export async function deleteAnalysis(userId, analysisId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/savedAnalyses/${analysisId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to delete analysis from backend");
    return true; // FIX: was `True` (Python syntax)
  } catch (error) {
    console.error("Error deleting analysis:", error.message);
    throw error;
  }
}

/**
 * Fetch live risk signals from Python backend (weather, geopolitical, commodity)
 */
export async function fetchSignalsFromBackend(suppliers, materials, companyName = null, routes = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        suppliers, 
        materials,
        company_name: companyName,
        routes: routes
      }),
    });
    if (!response.ok) throw new Error(`Backend signals error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching signals from backend:", error.message);
    return null; // Caller should fall back to direct API fetching
  }
}

/**
 * Save a custom company configuration to the database
 */
export async function saveCustomCompany(userId, companyData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/customCompanies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyData),
    });
    if (!response.ok) throw new Error("Failed to save company to backend");
    return await response.json();
  } catch (error) {
    console.error("Error saving custom company:", error.message);
    throw error;
  }
}

/**
 * Load custom companies for a user from the database
 */
export async function loadCustomCompanies(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/customCompanies`);
    if (!response.ok) throw new Error("Failed to load companies from backend");
    return await response.json();
  } catch (error) {
    console.error("Error loading custom companies:", error.message);
    return [];
  }
}
