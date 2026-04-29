import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function RiskDashboard({ company, product, riskData, signals, summary, incident, followUp, onReset, onBack, onSaveAnalysis, onShowSavedAnalyses, isAuthenticated }) {
  const { score, riskLevel, recommendations, anomalies, trend } = riskData;
  const [activeTab, setActiveTab] = useState("suppliers");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Top Header / Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
            <span>←</span> Back to products
          </button>
          <div className="flex gap-4">
             {isAuthenticated && (
                <button onClick={onShowSavedAnalyses} className="text-sm font-semibold text-slate-600 hover:text-indigo-600">
                  Saved Analyses
                </button>
             )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Live Monitoring Active
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{company.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-lg text-slate-500 font-medium">Product: <span className="text-slate-800">{product.name}</span></p>
              {trend && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  trend.trend === "worsening" ? "bg-rose-100 text-rose-700" :
                  trend.trend === "improving" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                }`}>
                  {trend.direction} {trend.trend} ({trend.change}pts)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={onReset} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
              Change Company
            </button>
            {isAuthenticated && (
              <button onClick={onSaveAnalysis} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95">
                Save Analysis
              </button>
            )}
          </div>
        </div>

        {/* Anomalies */}
        {anomalies && anomalies.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <AnomalyAlert anomalies={anomalies} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Risk Score Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-50" />
            <RiskGauge score={score.finalScore} level={riskLevel} />
          </div>

          {/* AI Insights (Gradient Glassmorphic) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full">
                <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">AI Executive Summary</h4>
                <p className="text-base font-medium leading-relaxed flex-grow">
                  {summary || "Analyzing global signals to generate executive summary..."}
                </p>
              </div>
            </div>

            {incident ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-500 font-bold">!</div>
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Incidents</h4>
                <p className="text-lg font-bold text-slate-900 mb-2 leading-snug">{incident.topIssue}</p>
                {incident.affectedRegions && incident.affectedRegions.length > 0 && (
                   <p className="text-sm text-slate-500">Affected: {incident.affectedRegions.join(", ")}</p>
                )}
              </div>
            ) : (
              <RiskBreakdown components={score.components} weights={score.weights} />
            )}
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          <div className="flex border-b border-slate-100 px-2 pt-2 bg-slate-50/50 overflow-x-auto">
            {["suppliers", "routes", "materials", "commodities"].map((t) => (
              <button 
                key={t} 
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)} Analysis
              </button>
            ))}
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "suppliers" && <SuppliersTab company={company} signals={signals} />}
                {activeTab === "routes" && <RoutesTab company={company} />}
                {activeTab === "materials" && <MaterialsTab product={product} />}
                {activeTab === "commodities" && <CommoditiesTab signals={signals} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && <RecommendationsPanel recommendations={recommendations} />}
      </div>
    </div>
  );
}

function RiskGauge({ score, level }) {
  const isHigh = score > 60;
  const isMedium = score > 40;
  
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="text-center w-full relative z-10 flex flex-col items-center">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Risk Index</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Gauge */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            className={isHigh ? 'text-rose-100' : isMedium ? 'text-amber-100' : 'text-emerald-100'}
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${isHigh ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'}`}
          />
        </svg>
        
        <div className="bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-sm z-10">
          <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">{score}</span>
          <p className={`text-xs font-bold mt-1 uppercase ${isHigh ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'}`}>
            {typeof level === 'string' ? level : level?.level || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskBreakdown({ components, weights }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Risk Breakdown</h3>
      <div className="space-y-4">
        {Object.entries(components).map(([key, value]) => {
          const isHigh = value > 60;
          const isMedium = value > 40;
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1 font-medium text-slate-700">
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function AnomalyAlert({ anomalies }) {
  return (
    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">!</div>
        <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide">Critical Anomalies Detected</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anomalies.map((anomaly, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-rose-100/50 shadow-sm">
            <p className="text-sm text-slate-900 font-bold mb-1">{anomaly.description}</p>
            <p className="text-xs text-rose-600 font-medium">Action: {anomaly.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuppliersTab({ company, signals }) {
  const geoRiskMap = {};
  if (signals?.geopoliticalRisk && Array.isArray(signals.geopoliticalRisk)) {
    signals.geopoliticalRisk.forEach(item => { geoRiskMap[item.country] = item; });
  }

  const weatherRiskMap = {};
  if (signals?.weatherRisk && Array.isArray(signals.weatherRisk)) {
    signals.weatherRisk.forEach(item => { weatherRiskMap[item.country] = item; });
  }

  return (
    <div className="space-y-4">
      {company.suppliers.map((supplier, i) => {
        const geoData = geoRiskMap[supplier.country];
        const weatherData = weatherRiskMap[supplier.country];
        return (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
            <div className="mb-3 sm:mb-0">
              <div className="text-base font-bold text-slate-900">{supplier.country}</div>
              <div className="text-sm font-medium text-slate-500">{Math.round(supplier.weight * 100)}% dependency</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {geoData && geoData.riskScore !== null && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${geoData.riskScore > 60 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  Geo Risk: {geoData.riskScore}
                </span>
              )}
              {weatherData && weatherData.riskScore !== null && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${weatherData.riskScore > 60 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  Weather: {weatherData.riskScore}
                </span>
              )}
              {(!geoData || geoData.riskScore === null) && (!weatherData || weatherData.riskScore === null) && (
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 text-slate-600">No signals detected</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoutesTab({ company }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {company.routes && company.routes.length > 0 ? company.routes.map((route, i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-sm font-bold text-slate-900 mb-1">{route.name}</div>
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>{route.origin}</span>
            <span className="text-indigo-400">→</span>
            <span>{route.destination}</span>
          </div>
        </div>
      )) : <div className="text-sm text-slate-500 p-4">No specific routes defined for this product.</div>}
    </div>
  );
}

function MaterialsTab({ product }) {
  return (
    <div className="flex flex-wrap gap-3">
      {product.criticalMaterials.map((material, i) => (
        <div key={i} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
          {material}
        </div>
      ))}
    </div>
  );
}

function CommoditiesTab({ signals }) {
  const commodityData = signals?.commodityStress;
  if (!commodityData || commodityData.length === 0) return <div className="text-sm text-slate-500 p-4">No commodity market data available for these materials.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {commodityData.map((item, i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-900">{item.material}</div>
            {item.priceChange !== undefined && (
              <div className={`text-xs font-bold mt-1 ${item.priceChange > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {item.priceChange > 0 ? "↑" : "↓"} {Math.abs(item.priceChange)}% change
              </div>
            )}
          </div>
          {item.riskScore !== null && (
            <div className={`inline-flex self-start px-3 py-1 rounded-lg text-xs font-bold ${item.riskScore > 60 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              Risk Index: {item.riskScore}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RecommendationsPanel({ recommendations }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Recommended Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, i) => {
          const isCritical = rec.priority === "critical";
          const isHigh = rec.priority === "high";
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className={`p-6 rounded-2xl border ${isCritical ? 'bg-rose-50 border-rose-100' : isHigh ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'bg-rose-600 text-white' : isHigh ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                  {rec.priority}
                </span>
                <span className="text-sm font-bold text-slate-900">{rec.category}</span>
              </div>
              <ul className="space-y-2">
                {rec.actions.map((action, j) => (
                  <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}

export default RiskDashboard;
