import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext.jsx";

function SavedAnalysesView({ analyses, onBack, onDelete, onLoadAnalysis }) {
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
             <button onClick={onBack} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2">
              <span>←</span> Return to Workspace
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
            Saved Analyses
          </h1>
          <p className="text-lg text-slate-500 max-w-xl">
            Review and restore your previously generated supply chain risk intelligence reports.
          </p>
        </div>
        
        {analyses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="w-24 h-24 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No saved analyses</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto">
              You haven't saved any risk reports yet. Generate an analysis and click "Save Analysis" to store it here.
            </p>
            <button 
              onClick={onBack}
              className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              Go to Workspace
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {analyses.map((analysis, index) => (
                <motion.div 
                  key={analysis.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-bold text-slate-400">
                        {analysis.companyName?.charAt(0) || "C"}
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1" title={analysis.companyName}>{analysis.companyName}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-1">{analysis.productName}</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onLoadAnalysis(analysis)}
                      className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors font-bold text-sm py-2.5 rounded-xl text-center"
                    >
                      Load Report
                    </button>
                    <button
                      onClick={() => onDelete(analysis.id)}
                      className="w-12 flex items-center justify-center bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors rounded-xl"
                      title="Delete Analysis"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedAnalysesView;
