import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginScreen() {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear body background inherited from previous design
  useEffect(() => {
    document.body.style.background = "#F8FAFC"; // slate-50
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || (isRegistering && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900"
      style={{
        "--text-primary": "#0f172a",
        "--text-secondary": "#475569",
        "--bg-primary": "#ffffff",
        "--bg-secondary": "#f8fafc",
        "--border-primary": "#e2e8f0"
      }}
    >
      {/* Subtle Pastel Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">EarlyBird</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
        </div>
        
        <div className="hidden md:block w-10" /> {/* Spacer for centering */}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center py-12">
          
          {/* Text Content (Left) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              AI-Powered Risk Intelligence
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-slate-900">
              Predict Supply Chain Risks <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
                Before They Disrupt.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
              The platform that empowers operations leaders to deliver resilient, high-quality sourcing at scale with an AI agent—continuously monitoring global signals 24/7.
            </p>
            
            {/* Embedded Form */}
            <div className="bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-900/5 rounded-3xl p-6 md:p-8 max-w-md relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              
              <h3 className="text-xl font-bold text-slate-800 mb-6 relative z-10">
                {isRegistering ? "Create your workspace" : "Access your dashboard"}
              </h3>
              
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-3 rounded-xl mb-4 relative z-10 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <AnimatePresence>
                  {isRegistering && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Work Email"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 px-6 py-4 rounded-xl bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      {isRegistering ? "Start Free Trial" : "Sign In"}
                      <motion.span 
                        className="inline-block"
                        whileHover={{ x: 4 }}
                      >
                        →
                      </motion.span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500 relative z-10">
                {isRegistering ? "Already have an account? " : "New to EarlyBird? "}
                <button 
                  onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                  className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  {isRegistering ? "Log in instead" : "Create a workspace"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Visual Mockup (Right) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative h-[600px] w-full hidden lg:block"
          >
            <div className="absolute inset-0 rounded-[40px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-indigo-900/5 p-6 overflow-hidden">
              
              {/* Map/Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
              
              {/* Abstract Connections */}
              <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0px 4px 10px rgba(79, 70, 229, 0.2))" }}>
                <motion.path 
                  d="M 100,150 Q 200,50 350,200 T 450,400" 
                  fill="none" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3"
                  strokeDasharray="10 10"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />
                <motion.path 
                  d="M 50,350 Q 250,450 300,250" 
                  fill="none" 
                  stroke="url(#gradient2)" 
                  strokeWidth="3"
                  strokeDasharray="8 8"
                  animate={{ strokeDashoffset: [0, 100] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating Node 1 */}
              <motion.div 
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[120px] left-[60px] bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 min-w-[200px]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Logistics</p>
                  <p className="text-sm font-bold text-slate-900">Route Cleared</p>
                </div>
              </motion.div>

              {/* Floating Node 2 - Risk */}
              <motion.div 
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[260px] right-[40px] bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 min-w-[220px] z-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20" />
                  <div className="relative w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">!</div>
                </div>
                <div>
                  <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider">Signal Detected</p>
                  <p className="text-sm font-bold text-slate-900">Port Strike: Hamburg</p>
                </div>
              </motion.div>

               {/* Floating Node 3 */}
               <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[100px] left-[100px] bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-w-[180px]"
              >
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">Analyzing Alternatives</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
