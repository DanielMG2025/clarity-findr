import { defineConfig, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react({ jsxImportSource: "@/i18n" }), {
    name: "local-jsx-runtime",
    configResolved(config: ResolvedConfig) {
      // Local runtimes must share the app context, not a bundled private copy.
      config.optimizeDeps.include = config.optimizeDeps.include?.filter(id => !id.startsWith("@/i18n/"));
    },
  }, mode === "development" && componentTagger()].filter(Boolean),
  optimizeDeps: { exclude: ["@/i18n/jsx-dev-runtime", "@/i18n/jsx-runtime"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
