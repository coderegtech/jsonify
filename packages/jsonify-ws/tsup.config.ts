import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom", "socket.io-client"],
    clean: true,
  },
  {
    entry: { server: "src/server.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    external: ["socket.io"],
  },
]);
