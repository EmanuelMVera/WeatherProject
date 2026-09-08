import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

// Validate required environment variables
// Note: VITE_API_URL should be set in .env.local
// For dev mode with Vite proxy, it's typically /api
// For preview/production, it should point to the actual backend URL
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    "VITE_API_URL is not set. Falling back to window.location.origin for API requests."
  );
}

// Fallback de última línea: si App entero explota, mostramos esto (nunca en blanco).
const rootFallback = (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      background: "#030816",
      color: "#f4f8ff",
      fontFamily: "Inter, system-ui, sans-serif",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: "42ch" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        La aplicación tuvo un problema
      </h1>
      <p style={{ opacity: 0.8, marginBottom: "1rem" }}>
        Algo falló al cargar la interfaz. Recargá la página para volver a
        intentarlo.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: "0.55rem 1.5rem",
          fontWeight: 600,
          color: "#03122b",
          background: "linear-gradient(135deg, #6a9ff1, #96c9ff)",
          border: "none",
          borderRadius: "9px",
          cursor: "pointer",
        }}
      >
        Recargar
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary fallback={rootFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
