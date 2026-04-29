import React from "react";
import { motion } from "framer-motion";

function CompanySelector({ companies, onSelect, onCustomSelect, onShowSavedAnalyses }) {
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
          
          <div className="flex gap-4">
            <button onClick={onShowSavedAnalyses} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Saved Analyses
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Select Your Workspace
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Choose a supply chain to monitor or create a new custom analysis to predict and mitigate risks.
          </p>
        </div>
        
        {companies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="w-24 h-24 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No supply chains yet</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto">
              Create your first supply chain analysis profile to get started with real-time risk intelligence.
            </p>
            <button 
              onClick={onCustomSelect}
              className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Create Supply Chain +
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((co, index) => (
              <motion.div 
                key={co.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelect(co)}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-indigo-500/10 hover:border-indigo-100 cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-xl font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                  {co.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{co.name}</h3>
                <p className="text-sm font-medium text-slate-500 mb-6">{co.category}</p>
                
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Products</span>
                    <span className="text-sm font-semibold text-slate-700">{co.products?.length || 1}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Suppliers</span>
                    <span className="text-sm font-semibold text-slate-700">{co.suppliers?.length || 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Company Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: companies.length * 0.1 }}
              onClick={onCustomSelect} 
              className="bg-slate-50/50 rounded-3xl p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] group"
            >
               <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors shadow-sm">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Create Workspace</h3>
               <p className="text-sm font-medium text-slate-500 mt-1">Analyze a new supply chain</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanySelector;
