import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on the current mode (development, production, etc.)
  // The third parameter '' ensures we load all variables, including those without the VITE_ prefix
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: env.PORT ? parseInt(env.PORT, 10) : 5173,
    },
  };
});
