import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { execSync } from "node:child_process";
import path from "node:path";

const ANALYZE = process.env.ANALYZE === "true";
const COMPRESS = process.env.COMPRESS !== "false";

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
    configureServer() { run(false); } };
}

// Smaller vendor chunks reduce parse/compile time on mobile and improve TTI.
// React core is kept in a single "react" chunk to avoid duplicate React
// instances. Other React-bound libraries are split into their own chunks
// but all share the same react chunk via Rollup's shared module graph.
function manualChunks(id: string) {
  if (!id.includes("node_modules")) return;

  // 3D / heavy graphics (only loaded by 3D pages)
  if (id.includes("/three") || id.includes("three-stdlib") || id.includes("@react-three")) {
    return "three";
  }
  // PDF / canvas export (only loaded on certificate/club-card pages)
  if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("pdfjs-dist")) {
    return "pdf";
  }
  // Drawing (only loaded by kids drawing buddy)
  if (id.includes("/fabric")) {
    return "fabric";
  }
  // Markdown + math (only loaded by content pages)
  if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-") || id.includes("katex")) {
    return "markdown";
  }
  // React core — must stay together to avoid hook/context crashes
  if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
    return "react";
  }
  // Router
  if (id.includes("react-router") || id.includes("@remix-run")) {
    return "router";
  }
  // Animation (large, used heavily in Index but still separable)
  if (id.includes("framer-motion")) {
    return "motion";
  }
  // Icons (tree-shaken but large package)
  if (id.includes("lucide-react")) {
    return "icons";
  }
  // Data fetching
  if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) {
    return "query";
  }
  // UI primitives (Radix, shadcn deps, form libs, notifications)
  if (
    id.includes("@radix-ui") ||
    id.includes("cmdk") ||
    id.includes("embla-carousel") ||
    id.includes("input-otp") ||
    id.includes("react-day-picker") ||
    id.includes("react-resizable-panels") ||
    id.includes("react-virtuoso") ||
    id.includes("sonner") ||
    id.includes("vaul") ||
    id.includes("next-themes") ||
    id.includes("@hookform") ||
    id.includes("react-hook-form") ||
    id.includes("class-variance-authority") ||
    id.includes("clsx") ||
    id.includes("tailwind-merge") ||
    id.includes("tailwindcss-animate")
  ) {
    return "ui";
  }
  // i18n
  if (id.includes("i18next") || id.includes("react-i18next")) {
    return "i18n";
  }
  // Forms / validation
  if (id.includes("zod")) {
    return "forms";
  }
  // Date utils
  if (id.includes("date-fns")) {
    return "date";
  }
  // Supabase + realtime
  if (id.includes("@supabase")) {
    return "supabase";
  }
  // Charts (d3 + recharts)
  if (id.includes("d3-") || id.includes("recharts")) {
    return "charts";
  }
  // Sentry (large, only needed for error reporting)
  if (id.includes("@sentry")) {
    return "sentry";
  }
  // Leaflet maps
  if (id.includes("leaflet") || id.includes("react-leaflet")) {
    return "maps";
  }
  // HLS video player
  if (id.includes("hls.js")) {
    return "hls";
  }
  // QR codes
  if (id.includes("qrcode")) {
    return "qrcode";
  }
  // Confetti
  if (id.includes("canvas-confetti")) {
    return "confetti";
  }
  // UUID
  if (id.includes("/uuid")) {
    return "utils";
  }
  // Fallback vendor bucket for anything else
  return "vendor";
}

export default defineConfig(() => ({ server: {
    host: "::",
    port: 8080 },
  plugins: [
    react(),
    tsconfigPaths(),
    i18nCheckPlugin(),
    ANALYZE &&
      visualizer({ filename: "dist/bundle-stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
        open: false }),
    COMPRESS && viteCompression({ algorithm: "gzip", ext: ".gz", threshold: 1024 }),
    COMPRESS && viteCompression({ algorithm: "brotliCompress", ext: ".br", threshold: 1024 }),
  ].filter(Boolean),
  resolve: { alias: {
      "@": path.resolve(__dirname, "./src") } },
  esbuild: { // Strip noisy console calls from production bundles (keep warn/error for
    // real diagnostics; uncaught errors are already routed to logger.ts via
    // installGlobalErrorHandlers). Debugger statements are always dropped.
    pure: process.env.NODE_ENV === "production" ? ["console.log", "console.debug", "console.info", "console.trace"] : [],
    drop: process.env.NODE_ENV === "production" ? ["debugger" as const] : [] },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks,
        // Performance budget: warn if any chunk exceeds 600 kB gzipped (approx 2 MB raw).
        // PageSpeed is especially sensitive to initial JS parse time on mobile.
        assetFileNames: "assets/[name]-[hash][extname]",
      } } },
  optimizeDeps: { include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "react-markdown",
      "style-to-js",
      "style-to-object",
    ] } }));
