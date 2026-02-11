# Jsonify — Socket.IO Real-Time Sync

This document covers how to set up and use the **Socket.IO server** and **client integration** for real-time JSON synchronization across multiple browser tabs or devices.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Server Setup](#server-setup)
5. [Client Setup](#client-setup)
6. [Usage Guide](#usage-guide)
7. [Socket.IO Events](#socketio-events)
8. [Configuration](#configuration)
9. [Integrating Into Your Own App](#integrating-into-your-own-app)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Jsonify includes a lightweight Socket.IO layer that enables **real-time synchronization** of JSON data between multiple connected clients. When one client edits JSON, changes are broadcast instantly to all other connected clients.

**Key features:**

- Zero-config local setup — runs on `http://localhost:4000` by default
- Built-in auto-reconnect with exponential backoff
- Connection status indicator in the UI (green / yellow / gray)
- Works alongside localStorage persistence (offline-first)
- No database required — the server holds data in memory
- CORS enabled out of the box

---

## Architecture

```
┌───────────────┐         ┌──────────────────┐         ┌───────────────┐
│  Browser Tab  │◄───────►│  Socket.IO Server │◄───────►│  Browser Tab  │
│   (Client A)  │  http:// │   (ws-server.ts)  │  http:// │   (Client B)  │
└───────────────┘         └──────────────────┘         └───────────────┘
       │                         │                            │
       │  emits "update"         │  broadcasts "sync"         │
       │  on local edit          │  to all other clients      │
       │                         │                            │
       ▼                         ▼                            ▼
  localStorage              In-memory store             localStorage
  (offline backup)          (latestData)               (offline backup)
```

**Data flow:**

1. Client edits JSON → emits `update` event with data to server
2. Server stores `latestData` in memory
3. Server broadcasts `sync` event with data to all **other** connected clients
4. Receiving clients update their local state (without pushing to undo history)
5. All clients also persist data to `localStorage` independently

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** / **npm** / **yarn**
- The project dependencies installed:

```bash
pnpm install
```

The Socket.IO dependencies (`socket.io` and `socket.io-client`) are already included in `package.json`.

---

## Server Setup

### 1. Start the Socket.IO Server

```bash
pnpm run ws:server
```

This runs `server/ws-server.ts` via `tsx`. You should see:

```
[socket.io] Server running on http://localhost:4000
```

### 2. Custom Port

Set the `WS_PORT` environment variable:

```bash
# Linux / macOS
WS_PORT=8080 pnpm run ws:server

# Windows (PowerShell)
$env:WS_PORT=8080; pnpm run ws:server

# Windows (CMD)
set WS_PORT=8080 && pnpm run ws:server
```

### 3. Run Alongside the Dev Server

Open **two terminals**:

```bash
# Terminal 1 — Socket.IO server
pnpm run ws:server

# Terminal 2 — Vite dev server
pnpm run dev
```

### Server File Reference

| File                  | Description                  |
| --------------------- | ---------------------------- |
| `server/ws-server.ts` | Socket.IO server entry point |

The server is ~40 lines. It tracks connected clients automatically, stores the latest JSON in memory, and broadcasts changes using `socket.broadcast.emit()`.

---

## Client Setup

The client integration consists of two pieces:

### 1. `useWebSocket` Hook (`src/hooks/useWebSocket.ts`)

A React hook that manages the full Socket.IO lifecycle:

```typescript
import { useWebSocket } from "@/hooks/useWebSocket";

const ws = useWebSocket(jsonData, onRemoteUpdate);
```

**Parameters:**

| Parameter        | Type                        | Description                                          |
| ---------------- | --------------------------- | ---------------------------------------------------- |
| `data`           | `JsonValue`                 | Current JSON state — sent to server on local changes |
| `onRemoteUpdate` | `(data: JsonValue) => void` | Callback fired when a remote client sends an update  |

**Returns:**

| Property     | Type                                            | Description                                      |
| ------------ | ----------------------------------------------- | ------------------------------------------------ |
| `status`     | `"disconnected" \| "connecting" \| "connected"` | Current connection state                         |
| `wsUrl`      | `string`                                        | Socket.IO URL (default: `http://localhost:4000`) |
| `setWsUrl`   | `(url: string) => void`                         | Update the Socket.IO URL                         |
| `connect`    | `(url: string) => void`                         | Initiate connection to the given URL             |
| `disconnect` | `() => void`                                    | Close connection and stop auto-reconnect         |

### 2. Integration in Page (`src/pages/Index.tsx`)

The hook is wired into the main page:

```tsx
import { useJsonEditor } from "@/hooks/useJsonEditor";
import { useWebSocket } from "@/hooks/useWebSocket";

const Index = () => {
  const editor = useJsonEditor();
  const { setData } = editor;

  // Handle incoming remote updates (without pushing to undo history)
  const handleRemoteUpdate = useCallback(
    (data: JsonValue) => {
      setData(data, false); // false = don't add to undo history
    },
    [setData],
  );

  const ws = useWebSocket(editor.data, handleRemoteUpdate);

  // Use ws.status, ws.connect, ws.disconnect in your UI...
};
```

### 3. UI Controls

The header bar includes built-in Socket.IO controls:

- **Status dot** — 🟢 green (connected), 🟡 yellow pulsing (connecting), ⚪ gray (disconnected)
- **URL input** — editable Socket.IO URL field (default `http://localhost:4000`)
- **Connect / Stop button** — toggle the connection

---

## Usage Guide

### Basic Workflow

1. **Start the server:**

   ```bash
   pnpm run ws:server
   ```

2. **Start the app:**

   ```bash
   pnpm run dev
   ```

3. **Open the app** in your browser (e.g., `http://localhost:5173`)

4. **Click "Connect"** in the header — the status dot turns green

5. **Open another tab** with the same URL and click "Connect"

6. **Edit JSON in either tab** — changes appear instantly in the other tab

### Multi-Device Sync

To sync across devices on the same network:

1. Find your local IP:

   ```bash
   # macOS / Linux
   ifconfig | grep "inet "
   # Windows
   ipconfig
   ```

2. Start the Socket.IO server (it binds to `0.0.0.0` by default)

3. On the remote device, change the Socket.IO URL in the header to:

   ```
   http://192.168.x.x:4000
   ```

4. Click **Connect**

---

## Socket.IO Events

The server and client communicate using Socket.IO events:

### Client → Server

**Event:** `update`

```typescript
socket.emit("update", data);
```

Sent when:

- Client first connects (pushes current state)
- User makes any local edit

### Server → Client

**Event:** `sync`

```typescript
socket.on("sync", (data) => {
  // Handle incoming data
});
```

Sent when:

- A new client connects (receives current server state)
- Another client pushes an update (broadcast to all others)

---

## Configuration

| Setting          | Default                 | How to Change                                                                           |
| ---------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| Server port      | `4000`                  | `WS_PORT` env variable                                                                  |
| Client URL       | `http://localhost:4000` | Edit in the header URL input, or change `DEFAULT_WS_URL` in `src/hooks/useWebSocket.ts` |
| Reconnect delay  | `3000ms`                | Built-in Socket.IO option, configured in `useWebSocket.ts` via `reconnectionDelay`      |
| LocalStorage key | `copy-canvas-json-data` | Change `STORAGE_KEY` in `src/hooks/useJsonEditor.ts`                                    |

---

## Integrating Into Your Own App

### Step 1: Install Dependencies

```bash
pnpm add socket.io socket.io-client
```

### Step 2: Copy the Server

Copy `server/ws-server.ts` into your project. Add a script to `package.json`:

```json
{
  "scripts": {
    "ws:server": "npx tsx server/ws-server.ts"
  }
}
```

### Step 3: Copy the Hook

Copy `src/hooks/useWebSocket.ts` into your project. Update the `JsonValue` import to match your data type.

### Step 4: Wire It Up

```tsx
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const [data, setData] = useState(initialData);

  const handleRemoteUpdate = useCallback((incoming) => {
    setData(incoming);
  }, []);

  const ws = useWebSocket(data, handleRemoteUpdate);

  return (
    <div>
      <p>Status: {ws.status}</p>
      <button onClick={() => ws.connect(ws.wsUrl)}>Connect</button>
      <button onClick={ws.disconnect}>Disconnect</button>
      {/* your editor UI */}
    </div>
  );
}
```

---

## Troubleshooting

### "Connection failed" or "connect_error"

- Make sure the Socket.IO server is running (`pnpm run ws:server`)
- Check the URL matches (default `http://localhost:4000`)
- Ensure the port is not blocked by a firewall
- Check browser console for CORS errors (server has CORS enabled by default)

### Status stays "connecting" (yellow)

- The server may not be running
- Port may be in use by another process:
  ```bash
  # Check what's on port 4000
  # macOS / Linux
  lsof -i :4000
  # Windows
  netstat -ano | findstr :4000
  ```

### Changes not syncing

- Both tabs must show a **green** status dot
- Check the browser console for `[socket.io]` log messages
- Verify both clients are connected to the same server URL

### Data resets on server restart

The server stores data **in memory only**. Restarting it clears the stored state. The next client to connect will push its local data (loaded from `localStorage`) to the server.

### Auto-reconnect behavior

Socket.IO automatically handles reconnection with exponential backoff. The client is configured to retry indefinitely with a 3-second initial delay. The status dot will show yellow during reconnection attempts. Click **Stop** to disable auto-reconnect.

---

## npm Scripts Reference

| Script               | Command                       | Description              |
| -------------------- | ----------------------------- | ------------------------ |
| `pnpm run dev`       | `vite`                        | Start Vite dev server    |
| `pnpm run ws:server` | `npx tsx server/ws-server.ts` | Start Socket.IO server   |
| `pnpm run build`     | `vite build`                  | Production build         |
| `pnpm run preview`   | `vite preview`                | Preview production build |
| `pnpm run test`      | `vitest run`                  | Run tests                |
