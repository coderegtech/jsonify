import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { JsonValue } from "./useJsonEditor";

type WsStatus = "disconnected" | "connecting" | "connected";

const DEFAULT_WS_URL = process.env.WS_URL || "http://localhost:4000";

export function useWebSocket(
  data: JsonValue,
  onRemoteUpdate: (data: JsonValue) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
  const isRemoteUpdate = useRef(false);
  const enabled = useRef(false);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const connect = useCallback(
    (url: string) => {
      cleanup();
      enabled.current = true;
      setStatus("connecting");

      const socket = io(url, {
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionAttempts: Infinity,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("connected");
        console.log("[socket.io] Connected to", url);
        // Push current data on connect
        socket.emit("update", data);
      });

      socket.on("sync", (syncData: JsonValue) => {
        isRemoteUpdate.current = true;
        onRemoteUpdate(syncData);
      });

      socket.on("disconnect", () => {
        setStatus("disconnected");
        console.log("[socket.io] Disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("[socket.io] Connection error:", err);
      });
    },
    [cleanup, data, onRemoteUpdate],
  );

  const disconnect = useCallback(() => {
    enabled.current = false;
    cleanup();
  }, [cleanup]);

  // Broadcast local changes to server
  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (socketRef.current?.connected) {
      socketRef.current.emit("update", data);
    }
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      enabled.current = false;
      cleanup();
    };
  }, [cleanup]);

  return { status, wsUrl, setWsUrl, connect, disconnect };
}
