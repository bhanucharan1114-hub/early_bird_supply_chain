import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext.jsx";
import Globe from "./Globe.jsx";
import { Factory, Cpu, Car, Pill, Smartphone, Box, Coffee, Shirt, Monitor } from "lucide-react";

const getCategoryIcon = (category) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes('electronics') || cat.includes('tech')) return <Cpu className="w-6 h-6" />;
  if (cat.includes('auto')) return <Car className="w-6 h-6" />;
  if (cat.includes('pharma') || cat.includes('health')) return <Pill className="w-6 h-6" />;
  if (cat.includes('apparel') || cat.includes('clothing') || cat.includes('fashion')) return <Shirt className="w-6 h-6" />;
  if (cat.includes('food') || cat.includes('beverage')) return <Coffee className="w-6 h-6" />;
  if (cat.includes('hardware') || cat.includes('device')) return <Smartphone className="w-6 h-6" />;
  if (cat.includes('logistics') || cat.includes('shipping')) return <Box className="w-6 h-6" />;
  return <Factory className="w-6 h-6" />;
};

function CompanySelector({ companies, onSelect, onCustomSelect, onShowSavedAnalyses }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 overflow-hidden relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-[100px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />

      {/* Top Header / Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">EarlyBird</span>
          </div>
          
          <div className="flex gap-4 items-center">
            <button onClick={onShowSavedAnalyses} className="text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors">
              Saved Analyses
            </button>
            <button onClick={logout} className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors ml-2">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-16 relative z-10">
        
        {/* Hero Section with Globe */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
          <div className="text-left lg:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight"
            >
              Select Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400">Workspace</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-lg"
            >
              Choose a supply chain to monitor or create a new custom analysis to predict and mitigate global risks.
            </motion.p>
          </div>
          <div className="lg:w-1/2 flex justify-center lg:justify-end relative h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]"
            >
              <Globe />
            </motion.div>
          </div>
        </div>
        
        {companies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-[32px] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="w-24 h-24 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
              className="px-8 py-4 rounded-full bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
            >
              Create Supply Chain +
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.slice(0, 5).map((co, index) => (
              <motion.div 
                key={co.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelect(co)}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-amber-500/10 hover:border-amber-100 cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center mb-6 text-slate-400 group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                  {getCategoryIcon(co.category)}
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
              transition={{ delay: Math.min(companies.length, 5) * 0.1 }}
              onClick={onCustomSelect} 
              className="bg-slate-50/50 rounded-3xl p-6 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] group"
            >
               <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-400 group-hover:text-amber-600 group-hover:border-amber-200 transition-colors shadow-sm">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-700 group-hover:text-amber-700 transition-colors">Create Workspace</h3>
               <p className="text-sm font-medium text-slate-500 mt-1">Analyze a new supply chain</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanySelector;
