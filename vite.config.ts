import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/dev-server/src",
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Heavy 3D libs — split into their own chunk so non-3D pages don't pay
          if (id.includes("node_modules/three") || id.includes("@react-three") || id.includes("node_modules/three-stdlib")) {
            return "three";
          }
          // PDF/canvas heavy libs — only load when generating certificates/exports
          if (id.includes("jspdf") || id.includes("html2canvas")) {
            return "pdf";
          }
          // Fabric (drawing) — only loaded for kids drawing buddy
          if (id.includes("node_modules/fabric")) {
            return "fabric";
          }
          // Charts — only for analytics/admin pages
          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts";
          }
          // Markdown + math rendering
          if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-") || id.includes("katex")) {
            return "markdown";
          }
          // Animation
          if (id.includes("framer-motion")) {
            return "motion";
          }
          // Icons (lucide)
          if (id.includes("lucide-react")) {
            return "icons";
          }
          // Forms
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("node_modules/zod")) {
            return "forms";
          }
          // Supabase
          if (id.includes("@supabase")) {
            return "supabase";
          }
          // Query
          if (id.includes("@tanstack/react-query")) {
            return "query";
          }
          // Radix UI
          if (id.includes("@radix-ui")) {
            return "ui";
          }
          // i18n
          if (id.includes("i18next") || id.includes("react-i18next")) {
            return "i18n";
          }
          // Date utils
          if (id.includes("date-fns")) {
            return "date";
          }
          // React core
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("react-router")) {
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion", "lucide-react"],
  },
}));
