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

// Critical chunks that must be preloaded for the home page to boot. These are
// the React core graph plus the libraries that the shell (Navbar, Index, Auth)
// loads immediately. Heavy page-specific libraries (3D, PDF, HLS, charts, etc.)
// are intentionally NOT preloaded — they are loaded on demand when the user
// navigates to a route that needs them.
const CRITICAL_CHUNK_RE = /(index|App|vendor|router|query|i18n|ui|supabase|date|forms|icons|utils)\-[A-Za-z0-9]+\.js$/;
const HEAVY_PAGE_CHUNK_RE = /(three|pdf|hls|maps|charts|fabric|markdown|sentry|motion|qrcode|confetti)\-[A-Za-z0-9]+\.js$/;

// Split the bundle so that the initial home page only pays for the libraries it
// actually needs. React core + CommonJS helpers stay in a single "vendor" chunk
// to avoid the production circular-dependency crash that happened when React was
// loaded from a feature chunk.
function manualChunks(id: string) {
  // Rollup/Vite CommonJS helpers and React core MUST stay together. If they land
  // in a feature chunk, React can be undefined when that feature chunk executes.
  if (id.includes("commonjsHelpers") || id.includes("\u0000commonjsHelpers")) {
    return "vendor";
  }
  if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
    return "vendor";
  }

  if (!id.includes("node_modules")) return;

  // Routing
  if (id.includes("react-router-dom") || id.includes("@remix-run/router")) {
    return "router";
  }

  // Data fetching
  if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) {
    return "query";
  }

  // Supabase + realtime (used by AuthContext and most shell components)
  if (id.includes("@supabase")) {
    return "supabase";
  }

  // i18n
  if (id.includes("i18next") || id.includes("react-i18next")) {
    return "i18n";
  }

  // UI primitives + icons (Navbar / Index shell uses these)
  if (
    id.includes("@radix-ui") ||
    id.includes("lucide-react") ||
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

  // Forms / validation
  if (id.includes("zod") || id.includes("@hookform/resolvers")) {
    return "forms";
  }

  // Date utils
  if (id.includes("date-fns")) {
    return "date";
  }

  // Animation (not in initial render — removed from Index critical path)
  if (id.includes("framer-motion")) {
    return "motion";
  }

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

  // Charts (d3 + recharts)
  if (id.includes("d3-") || id.includes("recharts")) {
    return "charts";
  }

  // Sentry (large, only needed for error reporting — deferred)
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

  // UUID / small utilities
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
    modulePreload: {
      polyfill: true,
      // Prevent Vite from preloading heavy page-specific chunks on the initial
      // home page. This eliminates the "Reduce unused JavaScript" penalty in
      // PageSpeed because the browser no longer downloads or parses 3D/PDF/HLS
      // /maps/charts/markdown/sentry libraries for a route that never uses them.
      resolveDependencies: (url, deps, { hostType }) => {
        // For JS dynamic imports, keep Vite's computed list — the route chunk
        // itself is only loaded when the user navigates there.
        if (hostType === "js") {
          return deps;
        }
        // For the HTML entry, only preload the critical shell chunks. Filter out
        // heavy feature chunks; they will be fetched on demand by the route.
        return deps.filter((dep) => {
          const fileName = path.basename(dep);
          return CRITICAL_CHUNK_RE.test(fileName) && !HEAVY_PAGE_CHUNK_RE.test(fileName);
        });
      },
    },
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
      "lucide-react",
      "react-markdown",
      "style-to-js",
      "style-to-object",
    ] } }));
