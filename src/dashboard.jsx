import React, { useState, useEffect } from "react";
import {
  calculateRiskScore,
  getRiskLevel,
  generateRecommendations,
  detectAnomalies,
} from "./risk-engine.js";
import { fetchAllSignals } from "./services/signal-fetchers.js";
import {
  generateExecutiveSummary,
  analyzeIncident,
  suggestFollowUpQuestions,
  calculateRiskTrend,
} from "./services/ai-explanation.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import {
  saveAnalysis,
  loadSavedAnalyses,
  deleteAnalysis,
  loadCustomCompanies,
  saveCustomCompany,
} from "./services/api.js";
import {
  trackAnalysisEvent,
  trackFeatureUsage,
  trackError,
} from "./services/analytics.js";
import LoginScreen from "./components/LoginScreen.jsx";
import CompanySelector from "./components/CompanySelector.jsx";
import CustomAnalysisForm from "./components/CustomAnalysisForm.jsx";
import ProductSelector from "./components/ProductSelector.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import SavedAnalysesView from "./components/SavedAnalysesView.jsx";
import RiskDashboard from "./components/RiskDashboard.jsx";

// ============================================================================
// ROOT COMPONENT
// ============================================================================
export default function SupplyChainDashboard() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [signals, setSignals] = useState(null);
  const [summary, setSummary] = useState("");
  const [incident, setIncident] = useState(null);
  const [followUp, setFollowUp] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showSavedAnalyses, setShowSavedAnalyses] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [customCompanies, setCustomCompanies] = useState([]);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Load user data and restore session on auth state change
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      loadUserCompanies();
      loadUserAnalyses();

      const lastCompany = sessionStorage.getItem("lastSelectedCompany");
      const lastProduct = sessionStorage.getItem("lastSelectedProduct");
      const lastRiskData = sessionStorage.getItem("lastRiskData");
      const currentView = sessionStorage.getItem("currentView");

      if (currentView === "riskDashboard" && lastCompany && lastProduct && lastRiskData) {
        try {
          setSelectedCompany(JSON.parse(lastCompany));
          setSelectedProduct(JSON.parse(lastProduct));
          setRiskData(JSON.parse(lastRiskData));
        } catch {
          // Corrupt session data — start fresh
        }
      } else if (currentView === "savedAnalyses") {
        setShowSavedAnalyses(true);
      } else if (currentView === "productSelector" && lastCompany) {
        try {
          setSelectedCompany(JSON.parse(lastCompany));
        } catch {
          // Ignore corrupt session
        }
      } else {
        sessionStorage.setItem("currentView", "companySelector");
      }
    }
  }, [isAuthenticated, user, authLoading]);

  const loadUserCompanies = async () => {
    try {
      const companies = await loadCustomCompanies(user.uid);
      setCustomCompanies(companies);
    } catch (error) {
      console.error("Error loading custom companies:", error);
    }
  };

  const loadUserAnalyses = async () => {
    try {
      const analyses = await loadSavedAnalyses(user.uid);
      setSavedAnalyses(analyses);
      return analyses;
    } catch (error) {
      console.error("Error loading saved analyses:", error);
      return [];
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedProduct(null);
    setRiskData(null);
    setSignals(null);
    setSummary("");
    setIncident(null);
    setFollowUp([]);
    setShowCustomForm(false);
    setShowSavedAnalyses(false);
    sessionStorage.setItem("currentView", "productSelector");
    trackAnalysisEvent("company_selected", {
      company_id: company.id,
      company_name: company.name,
    });
  };

  const handleCustomSubmit = async (customCompany) => {
    setSelectedCompany(customCompany);
    setSelectedProduct(customCompany.products[0]);
    setLoading(true);
    setShowCustomForm(false);

    // Persist to backend (non-blocking)
    saveCustomCompany(user.uid, customCompany)
      .then((savedCompany) => {
        setCustomCompanies((prev) => [
          ...prev,
          { ...customCompany, id: savedCompany.id },
        ]);
      })
      .catch((error) => {
        console.error("Error saving custom company:", error);
      });

    try {
      await handleProductSelect(customCompany.products[0].name, customCompany);
    } catch (error) {
      console.error("Error in product analysis:", error);
      setLoading(false);
      setShowCustomForm(true);
    }
  };

  const handleProductSelect = async (productName, companyOverride = null) => {
    const comp = companyOverride || selectedCompany;
    if (!comp) return;

    const product = comp.products.find((p) => p.name === productName);
    setSelectedProduct(product);
    setLoading(true);

    try {
      const allSignals = await fetchAllSignals(comp, product);
      setSignals(allSignals);

      const risk = calculateRiskScore(allSignals, comp);

      // Build historical scores from saved analyses for the same product
      const historicalScores = savedAnalyses
        .filter(
          (a) =>
            a.companyName === comp.name && a.productName === product.name
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((a) => a.riskScore);

      const newRiskData = {
        score: risk,
        riskLevel: getRiskLevel(risk.finalScore),
        recommendations: generateRecommendations(risk, allSignals, comp),
        anomalies: detectAnomalies(allSignals),
        trend: calculateRiskTrend(risk.finalScore, historicalScores),
      };
      setRiskData(newRiskData);

      sessionStorage.setItem("currentView", "riskDashboard");
      sessionStorage.setItem("lastSelectedCompany", JSON.stringify(comp));
      sessionStorage.setItem("lastSelectedProduct", JSON.stringify(product));
      sessionStorage.setItem("lastRiskData", JSON.stringify(newRiskData));

      trackAnalysisEvent("risk_score_calculated", {
        company: comp.name,
        product: product.name,
        risk_score: risk.finalScore,
        risk_level: getRiskLevel(risk.finalScore).level,
      });

      // AI narrative (non-blocking)
      try {
        const [sum, inc, fup] = await Promise.all([
          generateExecutiveSummary(risk, allSignals, comp, product),
          analyzeIncident(allSignals, comp),
          Promise.resolve(suggestFollowUpQuestions(risk, comp, product)),
        ]);
        setSummary(sum);
        setIncident(inc);
        setFollowUp(fup);
      } catch {
        setSummary("AI summary unavailable — review signals below.");
      }
    } catch (err) {
      console.error("Signal fetch failed:", err);
      trackError("signal_fetch_failed", err.message);
      alert("Error fetching supply chain signals. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to save analyses");
      return;
    }
    if (!selectedCompany || !selectedProduct || !riskData) {
      alert("Please complete the analysis first");
      return;
    }

    const analysisData = {
      companyName: selectedCompany.name,
      productId: selectedProduct.name,
      productName: selectedProduct.name,
      riskScore: riskData.score.finalScore,
      riskLevel: riskData.riskLevel.level || riskData.riskLevel,
      components: riskData.score.components,
      signals,
      summary,
      incident,
      followUp,
      recommendations: riskData.recommendations,
      anomalies: riskData.anomalies,
      trend: riskData.trend,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedAnalysis = await saveAnalysis(user.uid, analysisData);
      setSavedAnalyses((prev) => [savedAnalysis, ...prev]);
      trackFeatureUsage("save_analysis", {
        company: selectedCompany.name,
        product: selectedProduct.name,
      });
      alert("Analysis saved successfully!");
    } catch (error) {
      console.error("Error saving analysis:", error);
      trackError("save_analysis_failed", error.message);
      alert("Failed to save analysis");
    }
  };

  const handleLoadSavedAnalyses = async () => {
    if (!isAuthenticated) return;
    try {
      const analyses = await loadSavedAnalyses(user.uid);
      setSavedAnalyses(analyses);
      setShowSavedAnalyses(true);
      sessionStorage.setItem("currentView", "savedAnalyses");
    } catch (error) {
      console.error("Error loading analyses:", error);
      alert("Failed to load saved analyses");
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!isAuthenticated) return;
    try {
      await deleteAnalysis(user.uid, analysisId);
      setSavedAnalyses(savedAnalyses.filter((a) => a.id !== analysisId));
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert("Failed to delete analysis");
    }
  };

  const handleReset = () => {
    setSelectedCompany(null);
    setShowCustomForm(false);
    setShowSavedAnalyses(false);
    sessionStorage.setItem("currentView", "companySelector");
    sessionStorage.removeItem("lastSelectedCompany");
    sessionStorage.removeItem("lastSelectedProduct");
    sessionStorage.removeItem("lastRiskData");
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setRiskData(null);
    setSignals(null);
    setSummary("");
    setIncident(null);
    setFollowUp([]);
    sessionStorage.setItem("currentView", "productSelector");
    sessionStorage.removeItem("lastSelectedProduct");
    sessionStorage.removeItem("lastRiskData");
  };

  // ── Routing ──────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "var(--text-secondary)" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <LoginScreen />;

  if (showSavedAnalyses) {
    return (
      <SavedAnalysesView
        analyses={savedAnalyses}
        onBack={handleReset}
        onDelete={handleDeleteAnalysis}
        onLoadAnalysis={(analysis) => {
          const restoredCompany = {
            name: analysis.companyName,
            suppliers:
              analysis.signals?.geopoliticalRisk?.map((g) => ({
                country: g.country,
                weight: 0.5,
              })) || [],
            products: [
              {
                name: analysis.productName,
                criticalMaterials:
                  analysis.signals?.commodityStress?.map((c) => c.material) || [],
              },
            ],
            routes: [],
            alternateSuppliers: [],
            category: "Saved Analysis",
            description: `Saved on ${new Date(analysis.createdAt).toLocaleDateString()}`,
          };
          const restoredProduct = {
            name: analysis.productName,
            criticalMaterials:
              analysis.signals?.commodityStress?.map((c) => c.material) || [],
            leadTime: "N/A",
          };

          setSelectedCompany(restoredCompany);
          setSelectedProduct(restoredProduct);
          setRiskData({
            score: {
              finalScore: analysis.riskScore,
              components: analysis.components || {},
              weights: { geo: 0.35, weather: 0.25, commodity: 0.20, dependency: 0.20 },
            },
            riskLevel: analysis.riskLevel,
            recommendations: analysis.recommendations || [],
            anomalies: analysis.anomalies || [],
            trend: analysis.trend || { trend: "neutral", change: 0, direction: "→" },
          });
          setSignals(analysis.signals || null);
          setSummary(analysis.summary || "");
          setIncident(analysis.incident || null);
          setFollowUp(analysis.followUp || []);
          setShowSavedAnalyses(false);
          sessionStorage.setItem("currentView", "riskDashboard");
        }}
      />
    );
  }

  if (showCustomForm) {
    return (
      <CustomAnalysisForm
        onSubmit={handleCustomSubmit}
        onCancel={() => setShowCustomForm(false)}
      />
    );
  }

  if (!selectedCompany && !loading) {
    return (
      <CompanySelector
        companies={customCompanies}
        onSelect={handleCompanySelect}
        onCustomSelect={() => setShowCustomForm(true)}
        onShowSavedAnalyses={handleLoadSavedAnalyses}
      />
    );
  }

  if (loading) {
    return <LoadingScreen company={selectedCompany} product={selectedProduct} />;
  }

  if (!riskData) {
    return (
      <ProductSelector
        company={selectedCompany}
        onSelect={handleProductSelect}
        onBack={handleReset}
      />
    );
  }

  return (
    <RiskDashboard
      company={selectedCompany}
      product={selectedProduct}
      riskData={riskData}
      signals={signals}
      summary={summary}
      incident={incident}
      followUp={followUp}
      onReset={handleReset}
      onBack={handleBack}
      onSaveAnalysis={handleSaveAnalysis}
      onShowSavedAnalyses={handleLoadSavedAnalyses}
      isAuthenticated={isAuthenticated}
    />
  );
}
