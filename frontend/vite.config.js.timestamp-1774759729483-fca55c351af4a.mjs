// vite.config.js
import { defineConfig } from "file:///C:/Users/Maximus/Desktop/Portafolio/WeatherProject/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Maximus/Desktop/Portafolio/WeatherProject/frontend/node_modules/@vitejs/plugin-react-swc/index.mjs";
import dotenv from "file:///C:/Users/Maximus/Desktop/Portafolio/WeatherProject/frontend/node_modules/dotenv/lib/main.js";
dotenv.config();
var vite_config_default = defineConfig({
  plugins: [react()],
  // Only expose necessary env vars
  define: {
    "process.env": JSON.stringify({
      VITE_API_URL: process.env.VITE_API_URL
    })
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
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
          "fontawesome": ["@fortawesome/react-fontawesome", "@fortawesome/free-solid-svg-icons"]
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
        }
      }
    },
    // Optimize build size
    cssCodeSplit: true,
    cssMinify: "lightningcss",
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
        drop_debugger: true
      },
      format: {
        comments: false
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@fortawesome/react-fontawesome"],
    esbuildOptions: {
      target: "ES2020"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXhpbXVzXFxcXERlc2t0b3BcXFxcUG9ydGFmb2xpb1xcXFxXZWF0aGVyUHJvamVjdFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTWF4aW11c1xcXFxEZXNrdG9wXFxcXFBvcnRhZm9saW9cXFxcV2VhdGhlclByb2plY3RcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01heGltdXMvRGVza3RvcC9Qb3J0YWZvbGlvL1dlYXRoZXJQcm9qZWN0L2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7LyogZXNsaW50LWVudiBub2RlICovXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xyXG5cclxuZG90ZW52LmNvbmZpZygpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgXHJcbiAgLy8gT25seSBleHBvc2UgbmVjZXNzYXJ5IGVudiB2YXJzXHJcbiAgZGVmaW5lOiB7XHJcbiAgICBcInByb2Nlc3MuZW52XCI6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgVklURV9BUElfVVJMOiBwcm9jZXNzLmVudi5WSVRFX0FQSV9VUkwsXHJcbiAgICB9KSxcclxuICB9LFxyXG5cclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMFwiLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgXCJcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBPcHRpbWl6ZSBvdXRwdXRcclxuICAgIHRhcmdldDogXCJFUzIwMjBcIixcclxuICAgIG1pbmlmeTogXCJ0ZXJzZXJcIixcclxuICAgIFxyXG4gICAgLy8gRW5hYmxlIGNvZGUgc3BsaXR0aW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFNwbGl0IHZlbmRvciBsaWJyYXJpZXNcclxuICAgICAgICAgIFwicmVhY3QtdmVuZG9yXCI6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxyXG4gICAgICAgICAgXCJmb250YXdlc29tZVwiOiBbXCJAZm9ydGF3ZXNvbWUvcmVhY3QtZm9udGF3ZXNvbWVcIiwgXCJAZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnNcIl0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBDaHVuayBuYW1pbmcgZm9yIGNhY2hlIGJ1c3RpbmdcclxuICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJqcy9bbmFtZV0uW2hhc2hdLmpzXCIsXHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwianMvW25hbWVdLltoYXNoXS5qc1wiLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoeyBuYW1lIH0pID0+IHtcclxuICAgICAgICAgIGlmICgvXFwuY3NzJC8udGVzdChuYW1lID8/IFwiXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImNzcy9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdXCI7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKC9cXC4ocG5nfGpwZT9nfGdpZnxzdmcpJC8udGVzdChuYW1lID8/IFwiXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImltYWdlcy9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gXCJbbmFtZV0uW2hhc2hdW2V4dG5hbWVdXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gT3B0aW1pemUgYnVpbGQgc2l6ZVxyXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgY3NzTWluaWZ5OiBcImxpZ2h0bmluZ2Nzc1wiLFxyXG4gICAgXHJcbiAgICAvLyBJbmxpbmUgYXNzZXRzIHNtYWxsZXIgdGhhbiA0S0JcclxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxyXG5cclxuICAgIC8vIERpc2FibGUgc291cmNlbWFwcyBpbiBwcm9kdWN0aW9uIGZvciBzbWFsbGVyIGJ1bmRsZVxyXG4gICAgc291cmNlbWFwOiBmYWxzZSxcclxuXHJcbiAgICAvLyBDaHVuayBzaXplIHdhcm5pbmdzXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCxcclxuXHJcbiAgICAvLyBUZXJzZXIgb3B0aW9ucyBmb3IgYmV0dGVyIGNvbXByZXNzaW9uXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIGZvcm1hdDoge1xyXG4gICAgICAgIGNvbW1lbnRzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcIkBmb3J0YXdlc29tZS9yZWFjdC1mb250YXdlc29tZVwiXSxcclxuICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgIHRhcmdldDogXCJFUzIwMjBcIixcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxZQUFZO0FBRW5CLE9BQU8sT0FBTztBQUVkLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQTtBQUFBLEVBR2pCLFFBQVE7QUFBQSxJQUNOLGVBQWUsS0FBSyxVQUFVO0FBQUEsTUFDNUIsY0FBYyxRQUFRLElBQUk7QUFBQSxJQUM1QixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLE1BQzlDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBO0FBQUEsSUFHUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsV0FBVztBQUFBLFVBQ3JDLGVBQWUsQ0FBQyxrQ0FBa0MsbUNBQW1DO0FBQUEsUUFDdkY7QUFBQTtBQUFBLFFBRUEsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDNUIsY0FBSSxTQUFTLEtBQUssUUFBUSxFQUFFLEdBQUc7QUFDN0IsbUJBQU87QUFBQSxVQUNULFdBQVcseUJBQXlCLEtBQUssUUFBUSxFQUFFLEdBQUc7QUFDcEQsbUJBQU87QUFBQSxVQUNUO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBR0EsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBO0FBQUEsSUFHWCxtQkFBbUI7QUFBQTtBQUFBLElBR25CLFdBQVc7QUFBQTtBQUFBLElBR1gsdUJBQXVCO0FBQUE7QUFBQSxJQUd2QixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFNBQVMsYUFBYSxnQ0FBZ0M7QUFBQSxJQUNoRSxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
