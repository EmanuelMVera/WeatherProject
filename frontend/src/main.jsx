import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
