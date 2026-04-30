import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext.jsx";

function ProductSelector({ company, onSelect, onBack }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Top Header / Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">EarlyBird</span>
          </div>
          
          <div className="flex gap-4 items-center">
             <button onClick={onBack} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2 transition-colors">
              <span>←</span> Change Workspace
            </button>
            <button onClick={logout} className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors ml-2">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            {company.name}
          </h1>
          <p className="text-lg text-slate-500 max-w-xl">
            {company.description || "Select a product line to analyze supply chain risks."}
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Lines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.products.map((product, index) => (
            <motion.div 
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(product.name)}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-indigo-500/10 hover:border-indigo-100 cursor-pointer transition-all hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-xl font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                  {product.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-indigo-700 transition-colors">{product.name}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Lead Time</span>
                  <span className="text-slate-900 font-bold">{product.leadTime}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-500 font-medium">Critical Materials</span>
                  <div className="flex flex-wrap gap-1.5">
                     {product.criticalMaterials.map(m => (
                       <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">{m}</span>
                     ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductSelector;
