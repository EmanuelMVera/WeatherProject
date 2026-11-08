/* eslint-env node */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

/**
 * Inserta la URL pública del sitio (VITE_SITE_URL) en las etiquetas que
 * necesitan URLs absolutas (canonical, og:url, og:image). Si no está
 * definida, esas etiquetas se omiten en lugar de publicar un dominio falso.
 */
function siteUrlPlugin(siteUrl) {
  const base = siteUrl ? siteUrl.replace(/\/$/, "") : "";
  return {
    name: "buen-clima-site-url",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (base) return html.replaceAll("__SITE_URL__", base);
        return html
          .split("\n")
          .filter((line) => !line.includes("__SITE_URL__"))
          .join("\n");
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devApiTarget = env.DEV_API_PROXY_TARGET || "http://localhost:5000";

  return {
    plugins: [react(), siteUrlPlugin(env.VITE_SITE_URL)],

    server: {
      // En desarrollo, el frontend llama a /api/... en su mismo origen y Vite
      // lo reenvía al backend local: sin CORS ni URLs hardcodeadas.
      proxy: {
        "/api": { target: devApiTarget, changeOrigin: true },
        "/health": { target: devApiTarget, changeOrigin: true },
      },
    },

    build: {
      target: "es2020",
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            icons: [
              "@fortawesome/react-fontawesome",
              "@fortawesome/fontawesome-svg-core",
            ],
          },
        },
      },
    },

    esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,

    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.js"],
      include: ["src/**/*.test.{js,jsx}"],
      css: { modules: { classNameStrategy: "non-scoped" } },
      restoreMocks: true,
      // El primer test de cada archivo carga todos los módulos: margen para equipos lentos.
      testTimeout: 15_000,
    },
  };
});
