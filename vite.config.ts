import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import path from "node:path";

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
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      manifest: false, // We ship /manifest.webmanifest manually via index.html
      workbox: {
        // Precache only the small critical shell (index.html + entry chunks + icons).
        // Everything else (lazy route chunks, images) is cached at runtime on first hit —
        // avoids downloading tens of MB on install.
        globPatterns: ["index.html", "assets/index-*.js", "assets/index-*.css", "assets/vendor-*.js", "*.webmanifest", "pwa-*.png", "favicon.ico"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/~oauth/,
          /^\/functions\//,
          /^\/api\//,
          /^\/auth\/callback/,
        ],
        runtimeCaching: [
          // HTML navigations — always try network first, fall back to cached shell
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "unique-html-v1",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          // Same-origin hashed built assets — cache-first
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\/assets\/.+\.(?:js|css|woff2?)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "unique-assets-v1",
              expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Same-origin images and videos posters
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:png|jpg|jpeg|webp|avif|svg|ico|gif)$/i.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "unique-images-v1",
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts CSS + files
          {
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "unique-fonts-v1",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // NEVER cache these — auth / payments / analytics / functions must always hit network
        navigateFallbackAllowlist: [/^\/$/, /^\/[a-z0-9-\/]*$/i],
      },
    }),
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
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Heavy 3D core only. Keep @react-three packages with React vendor;
          // splitting them into this chunk caused production hook crashes.
          if (id.includes("node_modules/three/") || id.includes("node_modules/three-stdlib")) {
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
            id.includes("@react-three") ||
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
