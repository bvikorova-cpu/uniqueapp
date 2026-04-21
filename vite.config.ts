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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
          forms: ["react-hook-form", "zod", "@hookform/resolvers"],
          charts: ["recharts"],
        },
      },
    },
  },
}));
