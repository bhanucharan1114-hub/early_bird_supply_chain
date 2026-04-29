import React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

function Header({ onShowSavedAnalyses }) {
  const { user, isAuthenticated, logout, loginWithGoogle } = useAuth();

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "1.5rem 2.5rem",
      borderBottom: "1px solid var(--border-secondary)",
      marginBottom: "2rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "24px" }}>🚨</span>
        <h1 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
          Supply Chain Early Bird
        </h1>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isAuthenticated && (
          <button 
            onClick={onShowSavedAnalyses}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-secondary)",
              borderRadius: "var(--radius-md)",
              padding: "8px 16px",
              fontSize: "12px",
              color: "var(--text-secondary)"
            }}
          >
            Saved Analyses
          </button>
        )}
        
        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              fontSize: "13px",
              color: "var(--text-secondary)"
            }}>
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  style={{ 
                    width: "28px", 
                    height: "28px", 
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <div style={{ 
                  width: "28px", 
                  height: "28px", 
                  borderRadius: "50%", 
                  background: "var(--accent)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "#fff", 
                  fontSize: "12px", 
                  fontWeight: 600 
                }}>
                  {user?.displayName?.[0] || "?"}
                </div>
              )}
              <span>{user.displayName?.split(" ")[0]}</span>
            </div>
            <button 
              onClick={logout}
              style={{
                background: "var(--bg-danger)",
                border: "1px solid var(--border-danger)",
                borderRadius: "var(--radius-md)",
                padding: "8px 16px",
                fontSize: "12px",
                color: "var(--text-danger)"
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "8px 16px",
              fontSize: "12px",
              color: "#fff",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
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
