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

// Critical chunks that must be preloaded for the home page to boot. Keep the
// shell dependency graph intentionally compact: React + router + UI primitives
// live together in `vendor` to avoid production circular imports where a UI
// chunk tries to read React before the vendor chunk has finished evaluating.
const CRITICAL_CHUNK_RE = /(index|App|vendor|utils)\-[A-Za-z0-9]+\.js$/;
const HEAVY_PAGE_CHUNK_RE = /(three|pdf|hls|maps|charts|fabric|markdown|sentry|motion|qrcode|confetti)\-[A-Za-z0-9]+\.js$/;

// Split only truly heavy route-only libraries. Everything used by the shell
// stays in one stable `vendor` chunk. This is less aggressive than the previous
// micro-chunking, but it prevents circular production imports like
// vendor -> ui -> vendor that can make React undefined at boot.
function manualChunks(id: string) {
  if (!id.includes("node_modules")) return;

  // 3D / heavy graphics (only loaded by 3D pages)
  if (
    id.includes("/three") ||
    id.includes("three-stdlib") ||
    id.includes("@react-three") ||
    id.includes("@dimforge") ||
    id.includes("troika-three") ||
    id.includes("react-reconciler") ||
    id.includes("@monogrid/gainmap-js") ||
    id.includes("webgl-sdf-generator") ||
    id.includes("bidi-js") ||
    id.includes("fflate") ||
    id.includes("fast-png") ||
    id.includes("stackblur-canvas") ||
    id.includes("rgbcolor") ||
    id.includes("svg-pathdata") ||
    id.includes("iobuffer") ||
    id.includes("iceberg-js")
  ) {
    return "three";
  }

  // PDF / canvas export (only loaded on certificate/club-card pages)
  if (
    id.includes("jspdf") ||
    id.includes("html2canvas") ||
    id.includes("pdfjs-dist") ||
    id.includes("pako") ||
    id.includes("canvg") ||
    id.includes("@react-pdf")
  ) {
    return "pdf";
  }

  // Drawing (only loaded by kids drawing buddy)
  if (id.includes("/fabric")) {
    return "fabric";
  }

  // Markdown + math (only loaded by content pages)
  if (
    id.includes("react-markdown") ||
    id.includes("remark-") ||
    id.includes("rehype-") ||
    id.includes("katex") ||
    id.includes("dompurify") ||
    id.includes("micromark") ||
    id.includes("mdast-util") ||
    id.includes("hast-util") ||
    id.includes("hastscript") ||
    id.includes("unified") ||
    id.includes("vfile") ||
    id.includes("property-information") ||
    id.includes("markdown-table") ||
    id.includes("decode-named-character-reference") ||
    id.includes("character-entities") ||
    id.includes("trim-lines") ||
    id.includes("devlop") ||
    id.includes("longest-streak") ||
    id.includes("zwitch") ||
    id.includes("ccount")
  ) {
    return "markdown";
  }

  // Charts (d3 + recharts)
  if (id.includes("d3-") || id.includes("recharts") || id.includes("decimal.js-light")) {
    return "charts";
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

  // Video encoding (FFmpeg is heavy and only used on video generation pages)
  if (id.includes("@ffmpeg")) {
    return "ffmpeg";
  }

  // Fallback: all shell/shared dependencies stay together. Do not split React,
  // Radix, router, query, Sentry, forms, or Supabase into separate manual chunks;
  // Rollup can otherwise create evaluation cycles that blank the published app.
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
