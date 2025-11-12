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
      host: "0.0.0.0",
      port: 8080,
      strictPort: true, // Garantir que sempre use a porta 8080 (ou falhar se estiver ocupada)
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
      exclude: [], // Não excluir nada
      esbuildOptions: {
        target: "es2020",
        define: {
          global: "globalThis",
        },
      },
    },
  };
});
