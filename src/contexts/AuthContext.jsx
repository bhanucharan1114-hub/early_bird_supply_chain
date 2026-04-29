import React, { createContext, useContext, useState, useEffect } from "react";
import { trackAuthEvent } from "../services/analytics.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem("mock_auth_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const _getUsersDb = () => {
    try {
      const db = localStorage.getItem("mock_db_users");
      return db ? JSON.parse(db) : [];
    } catch (e) {
      return [];
    }
  };

  const _saveUsersDb = (users) => {
    localStorage.setItem("mock_db_users", JSON.stringify(users));
  };

  const registerWithEmail = async (email, password, name) => {
    try {
      const users = _getUsersDb();
      if (users.find(u => u.email === email)) {
        throw new Error("Email already registered");
      }

      const newUser = {
        uid: "user_" + Date.now(),
        email,
        password, // In a real app, NEVER store plain text passwords
        displayName: name,
        photoURL: "" 
      };

      users.push(newUser);
      _saveUsersDb(users);

      // Auto login after registration
      const sessionUser = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName, photoURL: newUser.photoURL };
      setUser(sessionUser);
      localStorage.setItem("mock_auth_user", JSON.stringify(sessionUser));
      trackAuthEvent("register", { method: "email" });
      
      return sessionUser;
    } catch (error) {
      console.error("Registration error:", error);
      trackAuthEvent("register_failed", { error: error.message });
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const users = _getUsersDb();
      const existingUser = users.find(u => u.email === email && u.password === password);
      
      if (!existingUser) {
        throw new Error("Invalid email or password");
      }

      const sessionUser = { uid: existingUser.uid, email: existingUser.email, displayName: existingUser.displayName, photoURL: existingUser.photoURL };
      setUser(sessionUser);
      localStorage.setItem("mock_auth_user", JSON.stringify(sessionUser));
      trackAuthEvent("login", { method: "email" });
      
      return sessionUser;
    } catch (error) {
      console.error("Login error:", error);
      trackAuthEvent("login_failed", { error: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("mock_auth_user");
      trackAuthEvent("logout", {});
    } catch (error) {
      console.error("Logout error:", error);
      trackAuthEvent("logout_failed", { error: error.message });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
