export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type WsStatus = "disconnected" | "connecting" | "connected";

export interface JsonifyWsOptions {
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
   * Initial JSON data to sync. Default: {}
   */
  initialData?: JsonValue;

  /**
   * Reconnection delay in ms. Default: 3000
   */
  reconnectionDelay?: number;

  /**
   * Callback fired when remote data is received.
   */
  onSync?: (data: JsonValue) => void;

  /**
   * Callback fired when connection status changes.
   */
  onStatusChange?: (status: WsStatus) => void;

  /**
   * Callback fired on connection error.
   */
  onError?: (error: Error) => void;
}

export interface JsonifyWsReturn {
  /** Current JSON data state */
  data: JsonValue;
  /** Update the JSON data (will broadcast to peers) */
  setData: (data: JsonValue) => void;
  /** Current connection status */
  status: WsStatus;
  /** Connect to the WebSocket server */
  connect: (url?: string) => void;
  /** Disconnect from the WebSocket server */
  disconnect: () => void;
  /** The resolved WebSocket URL */
  url: string;
}
