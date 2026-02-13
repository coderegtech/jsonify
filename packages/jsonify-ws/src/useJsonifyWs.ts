import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { JsonifyWsOptions, JsonifyWsReturn, JsonValue, WsStatus } from "./types";

/**
 * Get the WebSocket URL from options or environment.
 * Priority: options.url > WSL_URL env > fallback
 */
function resolveUrl(optionsUrl?: string): string {
  if (optionsUrl) return optionsUrl;

  // Support Vite env
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.WSL_URL) {
    return (import.meta as any).env.WSL_URL;
  }

  // Support process.env (Node / CRA / Next.js)
  if (typeof process !== "undefined" && process.env?.WSL_URL) {
    return process.env.WSL_URL;
  }

  return "http://localhost:4000";
}

/**
 * React hook for real-time JSON synchronization over WebSocket.
 *
 * @example
 * ```tsx
 * import { useJsonifyWs } from "jsonify-ws";
 *
 * function App() {
 *   const { data, setData, status, connect, disconnect } = useJsonifyWs({
 *     autoConnect: true,
 *     initialData: { hello: "world" },
 *   });
 *
 *   return <pre>{JSON.stringify(data, null, 2)}</pre>;
 * }
 * ```
 */
export function useJsonifyWs(options: JsonifyWsOptions = {}): JsonifyWsReturn {
  const {
    url: optionsUrl,
    autoConnect = false,
    initialData = {},
    reconnectionDelay = 3000,
    onSync,
    onStatusChange,
    onError,
  } = options;

  const resolvedUrl = resolveUrl(optionsUrl);
  const [data, setDataState] = useState<JsonValue>(initialData);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const dataRef = useRef(data);

  // Keep dataRef in sync
  dataRef.current = data;

  // Notify status changes
  const updateStatus = useCallback(
    (s: WsStatus) => {
      setStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange],
  );

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    updateStatus("disconnected");
  }, [updateStatus]);

  const connect = useCallback(
    (overrideUrl?: string) => {
      cleanup();
      const targetUrl = overrideUrl || resolvedUrl;
      updateStatus("connecting");

      const socket = io(targetUrl, {
        reconnection: true,
        reconnectionDelay,
        reconnectionAttempts: Infinity,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        updateStatus("connected");
        socket.emit("update", dataRef.current);
      });

      socket.on("sync", (syncData: JsonValue) => {
        isRemoteUpdate.current = true;
        setDataState(syncData);
        onSync?.(syncData);
      });

      socket.on("disconnect", () => {
        updateStatus("disconnected");
      });

      socket.on("connect_error", (err) => {
        onError?.(err);
      });
    },
    [cleanup, resolvedUrl, reconnectionDelay, onSync, onStatusChange, onError],
  );

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Public setData — updates local + broadcasts
  const setData = useCallback((newData: JsonValue) => {
    setDataState(newData);
  }, []);

  // Broadcast local changes
  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (socketRef.current?.connected) {
      socketRef.current.emit("update", data);
    }
  }, [data]);

  // Auto-connect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      cleanup();
    };
  }, []);

  return {
    data,
    setData,
    status,
    connect,
    disconnect,
    url: resolvedUrl,
  };
}
