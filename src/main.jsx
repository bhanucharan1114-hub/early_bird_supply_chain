import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import SupplyChainDashboard from "./dashboard.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SupplyChainDashboard />
    </AuthProvider>
  </React.StrictMode>
);
