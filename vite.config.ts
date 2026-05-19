import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { execSync } from "node:child_process";

const ANALYZE = process.env.ANALYZE === "true";

// Vite plugin: runs i18n key check on build start (and once at dev startup).
// Logs missing keys to console; fails the build if any locale is incomplete.
function i18nCheckPlugin() {
  let ran = false;
  const run = (failOnError: boolean) => {
    if (ran) return;
    ran = true;
    try {
      const out = execSync("node scripts/i18n-check.mjs", { stdio: "pipe" }).toString();
      console.log("\n[i18n-check]\n" + out);
    } catch (e: any) {
      const out = (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? "");
      console.error("\n[i18n-check] Missing translation keys detected:\n" + out);
      if (failOnError) throw new Error("i18n-check failed: missing translation keys");
    }
  };
  return {
    name: "i18n-check",
    buildStart() { run(true); },
    configureServer() { run(false); },
  };
}

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    i18nCheckPlugin(),
    ANALYZE &&
      visualizer({
        filename: "dist/bundle-stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
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
          // Keep Recharts in the main vendor graph. Splitting it into a
          // separate manual chunk caused a production-only React interop crash
          // on the published domain (`React.useState` was undefined).
          if (id.includes("d3-")) {
            return "charts";
          }
          // Markdown + math rendering
          if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-") || id.includes("katex")) {
            return "markdown";
          }
          // Forms: keep React-bound form libraries in vendor; zod is safe to split.
          if (id.includes("node_modules/zod")) {
            return "forms";
          }
          // Supabase
          if (id.includes("@supabase")) {
            return "supabase";
          }
          // i18n core only. Keep react-i18next in the main vendor graph because
          // splitting React-bound libraries caused production-only React namespace
          // crashes on the published domain (`createContext`/hooks undefined).
          if (id.includes("node_modules/i18next")) {
            return "i18n";
          }
          // Date utils
          if (id.includes("date-fns")) {
            return "date";
          }
          // React core and React-bound packages stay together to avoid namespace
          // interop crashes in production chunks.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("react-router") ||
            id.includes("react-i18next") ||
            id.includes("framer-motion") ||
            id.includes("lucide-react") ||
            id.includes("react-hook-form") ||
            id.includes("@hookform") ||
            id.includes("@radix-ui") ||
            id.includes("@tanstack/react-query")
          ) {
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "react-markdown",
      "style-to-js",
      "style-to-object",
    ],
  },
}));
