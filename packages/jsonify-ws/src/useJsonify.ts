import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { JsonValue, WsStatus } from "./types";
import {
  scanDataCopyElements,
  enableEditMode,
  disableEditMode,
  syncElementsFromData,
  setByPath,
  injectEditToggle,
  injectWsStatusIndicator,
  type DataCopyElement,
} from "./data-copy";

export interface UseJsonifyOptions {
  /**
   * WebSocket server URL. Defaults to WSL_URL env variable.
   * Falls back to "http://localhost:4000" if not set.
   */
  url?: string;

  /**
   * Auto-connect on mount. Default: false
   */
  autoConnect?: boolean;

  /**
   * Initial JSON data. Default: {}
   */
  initialData?: Record<string, JsonValue>;

  /**
   * Reconnection delay in ms. Default: 3000
   */
  reconnectionDelay?: number;

  /**
   * Callback fired when remote data is received.
   */
  onSync?: (data: Record<string, JsonValue>) => void;

  /**
   * Callback fired when connection status changes.
   */
  onStatusChange?: (status: WsStatus) => void;

  /**
   * Callback fired on connection error.
   */
  onError?: (error: Error) => void;

  /**
   * Target document for data-copy scanning.
   * Defaults to window.document.
   * Pass an iframe's contentDocument to scan an iframe.
   */
  targetDocument?: Document;

  /**
   * Auto-inject the floating edit toggle button. Default: true
   */
  injectToggle?: boolean;

  /**
   * Auto-inject the WebSocket connection status indicator. Default: false
   */
  injectStatusIndicator?: boolean;

  /**
   * Persist edit mode state in localStorage. Default: true
   */
  persistEditMode?: boolean;
}

export interface UseJsonifyReturn {
  /** Current JSON data state */
  data: Record<string, JsonValue>;
  /** Update the JSON data (will broadcast to peers) */
  setData: (data: Record<string, JsonValue>) => void;
  /** Update a single path in the data */
  setPath: (path: string, value: JsonValue) => void;
  /** Current connection status */
  status: WsStatus;
  /** Connect to the WebSocket server */
  connect: (url?: string) => void;
  /** Disconnect from the WebSocket server */
  disconnect: () => void;
  /** The resolved WebSocket URL */
  url: string;
  /** Whether edit mode is active */
  editMode: boolean;
  /** Toggle edit mode on/off */
  toggleEditMode: () => void;
  /** Set edit mode explicitly */
  setEditMode: (active: boolean) => void;
  /** Scanned data-copy elements */
  elements: DataCopyElement[];
  /** Re-scan the document for data-copy elements */
  rescan: () => void;
}

function resolveUrl(optionsUrl?: string): string {
  if (optionsUrl) return optionsUrl;

  // Support Vite env
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_WSL_URL) {
    return (import.meta as any).env.VITE_WSL_URL;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.WSL_URL) {
    return (import.meta as any).env.WSL_URL;
  }

  // Support process.env (Node / CRA / Next.js)
  if (typeof process !== "undefined" && process.env?.REACT_APP_WSL_URL) {
    return process.env.REACT_APP_WSL_URL;
  }
  if (typeof process !== "undefined" && process.env?.WSL_URL) {
    return process.env.WSL_URL;
  }

  return "http://localhost:4000";
}

/**
 * React hook for real-time JSON synchronization with data-copy attribute support.
 *
 * @example
 * ```tsx
 * import { useJsonify } from "jsonify-ws";
 *
 * function App() {
 *   const j = useJsonify({
 *     autoConnect: true,
 *     initialData: { home: { title: "Hello" } },
 *   });
 *
 *   return (
 *     <div>
 *       <p>Status: {j.status}</p>
 *       <button onClick={j.toggleEditMode}>
 *         {j.editMode ? "Stop Editing" : "Edit Mode"}
 *       </button>
 *       <h1 data-copy="home.title">{j.data.home?.title}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export function useJsonify(options: UseJsonifyOptions = {}): UseJsonifyReturn {
  const {
    url: optionsUrl,
    autoConnect = false,
    initialData = {},
    reconnectionDelay = 3000,
    onSync,
    onStatusChange,
    onError,
    targetDocument,
    injectToggle = true,
    injectStatusIndicator = false,
    persistEditMode = true,
  } = options;

  const resolvedUrl = resolveUrl(optionsUrl);
  const [data, setDataState] = useState<Record<string, JsonValue>>(initialData);
  const [status, setStatus] = useState<WsStatus>("disconnected");

  // Load edit mode from localStorage if persistEditMode is enabled
  const getInitialEditMode = (): boolean => {
    if (!persistEditMode) return false;
    try {
      const saved = localStorage.getItem("jsonify-edit-mode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  };

  const [editMode, setEditModeState] = useState(getInitialEditMode);
  const [elements, setElements] = useState<DataCopyElement[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const dataRef = useRef(data);
  const editModeRef = useRef(editMode);
  const elementsRef = useRef(elements);
  const cleanupToggleRef = useRef<(() => void) | null>(null);
  const wsStatusRef = useRef<{ cleanup: () => void; updateStatus: (status: WsStatus) => void } | null>(null);

  dataRef.current = data;
  editModeRef.current = editMode;
  elementsRef.current = elements;

  const updateStatus = useCallback(
    (s: WsStatus) => {
      setStatus(s);
      onStatusChange?.(s);
      // Update the visual status indicator if injected
      wsStatusRef.current?.updateStatus(s);
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

      socket.on("sync", (syncData: Record<string, JsonValue>) => {
        isRemoteUpdate.current = true;
        setDataState(syncData);
        onSync?.(syncData);
        // Sync data-copy elements with new data
        if (editModeRef.current) {
          syncElementsFromData(elementsRef.current, syncData);
        }
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

  const setData = useCallback((newData: Record<string, JsonValue>) => {
    setDataState(newData);
  }, []);

  const setPath = useCallback((path: string, value: JsonValue) => {
    setDataState((prev) => setByPath(prev, path, value));
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

  // Scan for data-copy elements
  const rescan = useCallback(() => {
    const doc = targetDocument || (typeof document !== "undefined" ? document : null);
    if (!doc) return;
    const found = scanDataCopyElements(doc);
    setElements(found);
    return found;
  }, [targetDocument]);

  // Handle edit mode toggle
  const setEditMode = useCallback(
    (active: boolean) => {
      setEditModeState(active);

      // Persist to localStorage if enabled
      if (persistEditMode) {
        try {
          localStorage.setItem("jsonify-edit-mode", JSON.stringify(active));
        } catch {
          // Ignore localStorage errors
        }
      }

      const currentElements = elementsRef.current.length > 0 ? elementsRef.current : (rescan() || []);

      if (active) {
        enableEditMode(currentElements);
        syncElementsFromData(currentElements, dataRef.current);

        // Attach input listeners
        for (const item of currentElements) {
          const handler = () => {
            const newVal = item.element.textContent || "";
            setDataState((prev) => setByPath(prev, item.path, newVal));
          };
          item.element.addEventListener("input", handler);
          (item.element as any).__jsonifyHandler = handler;
        }
      } else {
        // Remove input listeners
        for (const item of currentElements) {
          if ((item.element as any).__jsonifyHandler) {
            item.element.removeEventListener("input", (item.element as any).__jsonifyHandler);
            delete (item.element as any).__jsonifyHandler;
          }
        }
        disableEditMode(currentElements);
      }
    },
    [rescan, persistEditMode],
  );

  const toggleEditMode = useCallback(() => {
    setEditMode(!editModeRef.current);
  }, [setEditMode]);

  // Inject floating toggle button
  useEffect(() => {
    if (!injectToggle) return;
    const doc = targetDocument || (typeof document !== "undefined" ? document : null);
    if (!doc) return;

    cleanupToggleRef.current = injectEditToggle(doc, (active) => {
      setEditMode(active);
    });

    return () => {
      cleanupToggleRef.current?.();
    };
  }, [injectToggle, targetDocument, setEditMode]);

  // Inject WebSocket status indicator
  useEffect(() => {
    if (!injectStatusIndicator) return;
    const doc = targetDocument || (typeof document !== "undefined" ? document : null);
    if (!doc) return;

    wsStatusRef.current = injectWsStatusIndicator(doc);
    // Set initial status
    wsStatusRef.current.updateStatus(status);

    return () => {
      wsStatusRef.current?.cleanup();
      wsStatusRef.current = null;
    };
  }, [injectStatusIndicator, targetDocument]);

  // Initial scan
  useEffect(() => {
    rescan();
  }, [rescan]);

  // Re-apply edit mode after initial scan if it was persisted
  useEffect(() => {
    if (editMode && elements.length > 0) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        setEditMode(true);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [elements.length, editMode, setEditMode]);

  return {
    data,
    setData,
    setPath,
    status,
    connect,
    disconnect,
    url: resolvedUrl,
    editMode,
    toggleEditMode,
    setEditMode,
    elements,
    rescan,
  };
}
