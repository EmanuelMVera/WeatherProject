/* eslint-env node */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import compression from "vite-plugin-compression";
import visualizer from "rollup-plugin-visualizer";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
      deleteOriginFile: false,
    }),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
    }),
  ],
  
  // Only expose necessary env vars
  define: {
    "process.env": JSON.stringify({
      VITE_API_URL: process.env.VITE_API_URL,
    }),
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  build: {
    // Optimize output
    target: "ES2020",
    minify: "terser",
    
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          "react-vendor": ["react", "react-dom"],
          "fontawesome": ["@fortawesome/react-fontawesome", "@fortawesome/free-solid-svg-icons"],
        },
        // Chunk naming for cache busting
        chunkFileNames: "js/[name].[hash].js",
        entryFileNames: "js/[name].[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.css$/.test(name ?? "")) {
            return "css/[name].[hash][extname]";
          } else if (/\.(png|jpe?g|gif|svg)$/.test(name ?? "")) {
            return "images/[name].[hash][extname]";
          }
          return "[name].[hash][extname]";
        },
      },
    },

    // Optimize build size
    cssCodeSplit: true,
    
    // Inline assets smaller than 4KB
    assetsInlineLimit: 4096,

    // Disable sourcemaps in production for smaller bundle
    sourcemap: false,

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@fortawesome/react-fontawesome"],
    esbuildOptions: {
      target: "ES2020",
    },
  },
});
