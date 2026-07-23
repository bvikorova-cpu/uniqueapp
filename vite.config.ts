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
