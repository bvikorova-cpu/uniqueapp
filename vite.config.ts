import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcPath,
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
        },
      },
    },
  },
}));
