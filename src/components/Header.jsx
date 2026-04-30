import React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

function Header({ onShowSavedAnalyses }) {
  const { user, isAuthenticated, logout, loginWithGoogle } = useAuth();

  return (
    <div className="flex justify-between items-center px-6 md:px-10 py-5 border-b border-white/10 mb-8 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl drop-shadow-md">🚨</span>
        <h1 className="text-lg font-bold text-white tracking-wide">
          Supply Chain Early Bird
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <button 
            onClick={onShowSavedAnalyses}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-500/50 text-white text-sm font-bold backdrop-blur-md transition-all shadow-lg shadow-blue-500/20"
          >
            Saved Analyses
          </button>
        )}
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shadow-md"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold ring-2 ring-indigo-500/20">
                  {user?.displayName?.[0] || "?"}
                </div>
              )}
              <span className="hidden sm:inline-block">{user.displayName?.split(" ")[0]}</span>
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 border border-rose-500/50 text-white text-sm font-bold backdrop-blur-md transition-all shadow-lg shadow-rose-500/20"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 text-white text-sm font-bold backdrop-blur-md transition-all shadow-lg shadow-indigo-600/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
