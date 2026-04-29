import React from "react";
import { motion } from "framer-motion";

function LoadingScreen({ company, product }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-indigo-900/5 p-10 text-center relative overflow-hidden">
        {/* Scanning laser effect */}
        <motion.div 
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-0"
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-600"
            />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing {company?.name}</h2>
          <p className="text-slate-500 font-medium mb-8 bg-slate-100 px-4 py-1.5 rounded-full inline-block">
            {product?.name || "Initializing scan..."}
          </p>

          <div className="flex flex-col gap-3 w-full text-left">
            <LoadingStep text="Scanning global news feeds..." delay={0} />
            <LoadingStep text="Correlating weather patterns..." delay={0.8} />
            <LoadingStep text="Checking commodity stress..." delay={1.6} />
            <LoadingStep text="Generating AI risk summary..." delay={2.4} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingStep({ text, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 text-sm font-medium text-slate-600"
    >
      <motion.div 
        initial={{ scale: 0.5, backgroundColor: "#cbd5e1" }}
        animate={{ scale: 1, backgroundColor: "#4F46E5" }}
        transition={{ delay: delay + 0.5, duration: 0.3 }}
        className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </motion.div>
      {text}
    </motion.div>
  );
}

export default LoadingScreen;
