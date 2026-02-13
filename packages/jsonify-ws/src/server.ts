import { Server } from "socket.io";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Create and start a jsonify-ws sync server.
 *
 * @param port - Port number (default: WSL_URL port or 4000)
 * @param corsOrigin - CORS origin (default: "*")
 */
export function createJsonifyServer(
  port: number = Number(process.env.WS_PORT) || 4000,
  corsOrigin: string | string[] = "*",
) {
  const io = new Server(port, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  let latestData: JsonValue | null = null;

  io.on("connection", (socket) => {
    console.log(`[jsonify-ws] Client connected (${io.engine.clientsCount} total)`);

    if (latestData !== null) {
      socket.emit("sync", latestData);
    }

    socket.on("update", (data: JsonValue) => {
      latestData = data;
      socket.broadcast.emit("sync", latestData);
    });

    socket.on("disconnect", () => {
      console.log(`[jsonify-ws] Client disconnected (${io.engine.clientsCount} total)`);
    });

    socket.on("error", (err) => {
      console.error("[jsonify-ws] Socket error:", err);
    });
  });

  console.log(`[jsonify-ws] Server running on http://localhost:${port}`);
  return io;
}

// Auto-start when run directly
if (typeof require !== "undefined" && require.main === module) {
  createJsonifyServer();
}

// Also auto-start for ESM direct execution
const isMainModule =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("/server.ts") ||
    process.argv[1].endsWith("/server.js") ||
    process.argv[1].endsWith("/server.mjs"));

if (isMainModule) {
  createJsonifyServer();
}
