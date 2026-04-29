import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomAnalysisForm({ onSubmit, onCancel }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    materials: "",
    suppliers: "",
    routes: "",
    alternateSuppliers: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < totalSteps) {
      nextStep();
      return;
    }
    
    // Validate required fields
    if (!formData.name.trim() || !formData.category.trim() || !formData.materials.trim() || !formData.suppliers.trim()) {
      alert("Please fill in all required fields (Name, Category, Materials, Suppliers)");
      return;
    }
    
    const supplierList = formData.suppliers.split(",").map(s => {
      const [country, weightStr] = s.split(":");
      return {
        country: country?.trim() || "Unknown",
        weight: (parseFloat(weightStr) || 100) / 100,
        riskFactors: ["Custom Input"],
      };
    });

    const routesList = formData.routes.trim() 
      ? formData.routes.split(",").map(r => ({
          name: r.trim(),
          origin: r.split("to")[0]?.trim() || "Unknown",
          destination: r.split("to")[1]?.trim() || "Unknown",
          distance: "N/A",
          duration: "N/A",
          alternate: "N/A"
        }))
      : [];

    const company = {
      id: "custom_" + Date.now(),
      name: formData.name || "Custom Company",
      category: formData.category || "Custom Category",
      description: "User-defined supply chain",
      products: [
        {
          name: "Custom Product",
          criticalMaterials: formData.materials.split(",").map(m => m.trim()).filter(Boolean),
          leadTime: "N/A"
        }
      ],
      suppliers: supplierList.length > 0 ? supplierList : [{ country: "USA", weight: 1, riskFactors: [] }],
      routes: routesList,
      alternateSuppliers: formData.alternateSuppliers.trim() 
        ? formData.alternateSuppliers.split(",").map(s => ({ country: s.trim(), materials: [], reliability: 0.8 }))
        : [],
    };

    try {
      await onSubmit(company);
    } catch (error) {
      console.error("Error submitting company:", error);
      alert("Error submitting form.");
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <span className="text-xl">←</span> Back to Dashboard
          </button>
          <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full uppercase tracking-wider">
            Risk Analysis Wizard
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-2xl shadow-indigo-900/5 p-8 md:p-12 overflow-hidden relative">
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-12">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step > i ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 left-0 h-full bg-indigo-500"
                />
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Profile */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Company Profile</h2>
                  <p className="text-slate-500 mb-8">Let's start with the basics of your supply chain.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                      <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Acme Corp" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-slate-900 placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Product Category</label>
                      <input name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., EV Battery Manufacturing" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-slate-900 placeholder:text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Materials */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Critical Materials</h2>
                  <p className="text-slate-500 mb-8">What are the foundational components of your product?</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Raw Materials <span className="text-slate-400 font-normal">(Comma separated)</span></label>
                      <input name="materials" value={formData.materials} onChange={handleChange} required placeholder="e.g., Lithium, Copper, Semiconductors" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-slate-900 placeholder:text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Suppliers */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Global Suppliers</h2>
                  <p className="text-slate-500 mb-8">Where are your materials coming from?</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Primary Countries & Dependency %</label>
                      <div className="text-xs text-slate-500 mb-3 bg-slate-100 p-3 rounded-lg border border-slate-200">Format: <strong>Country:Percentage, Country:Percentage</strong> (e.g., China:70, Taiwan:30)</div>
                      <input name="suppliers" value={formData.suppliers} onChange={handleChange} required placeholder="e.g., China:70, Taiwan:30" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-slate-900 placeholder:text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Logistics */}
              {step === 4 && (
                <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Logistics & Alternatives</h2>
                  <p className="text-slate-500 mb-8">Map out your shipping routes and backup plans.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Shipping Routes <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input name="routes" value={formData.routes} onChange={handleChange} placeholder="e.g., Shanghai to Los Angeles, Taipei to Seattle" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-slate-900 placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Alternate Suppliers <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input name="alternateSuppliers" value={formData.alternateSuppliers} onChange={handleChange} placeholder="e.g., Vietnam, India" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-slate-900 placeholder:text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-6">
              <button 
                type="button" 
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 font-semibold text-slate-500 hover:text-slate-900 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                ← Back
              </button>
              
              <button 
                type="submit"
                className="px-8 py-3 rounded-full bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
              >
                {step === totalSteps ? "Analyze Risk" : "Continue"}
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
