import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

// Último recurso: si la app entera falla, nunca queda una pantalla en blanco.
const rootFallback = (
  <div
    role="alert"
    style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "1.5rem",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: "42ch" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Buen Clima tuvo un problema</h1>
      <p style={{ color: "#b3c3df", marginBottom: "1rem" }}>
        Algo falló al cargar la aplicación. Recargá la página para volver a intentarlo.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          minHeight: 44,
          padding: "0 1.5rem",
          fontWeight: 600,
          color: "#04172f",
          background: "#7cc4ff",
          border: "none",
          borderRadius: 999,
        }}
      >
        Recargar
      </button>
    </div>
  </div>
);

// Uso sin conexión: sólo en producción, para no interferir con la recarga de Vite.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* sin service worker la app funciona igual, sólo que no offline */
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary fallback={rootFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
