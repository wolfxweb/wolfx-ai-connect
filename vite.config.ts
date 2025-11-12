import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Configuração específica para o Dexie
  const isDev = mode === "development";
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), isDev && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      conditions: ["browser", "module", "import", "development"],
    },
    optimizeDeps: {
      include: ["dexie"],
      force: true,
      esbuildOptions: {
        target: "es2020",
      },
    },
    ssr: {
      noExternal: ["dexie"],
    },
  };
});
