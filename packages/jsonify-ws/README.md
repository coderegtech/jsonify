# jsonify-ws

Real-time JSON synchronization over WebSocket using Socket.IO. Provides React hooks for the client, a `data-copy` attribute system for inline content editing, and a ready-to-run sync server.

## Install

```bash
npm install jsonify-ws socket.io-client
```

## Environment Variable

Set `WSL_URL` to your WebSocket server URL:

```env
# .env (Vite)
VITE_WSL_URL=http://localhost:4000

# .env (CRA / Next.js)
REACT_APP_WSL_URL=http://localhost:4000

# Or set directly
WSL_URL=http://localhost:4000
```

> If not set, defaults to `http://localhost:4000`.

## Quick Start

### 1. Start the server

```bash
# Option A: CLI
npx jsonify-ws-server

# Option B: Programmatic
```

```ts
import { createJsonifyServer } from "jsonify-ws/server";

createJsonifyServer(4000); // port, cors origin
```

### 2. Use the `useJsonify()` hook

```tsx
import { useJsonify } from "jsonify-ws";

function App() {
  const j = useJsonify({
    autoConnect: true,
    initialData: { home: { title: "Hello World", subtitle: "Edit me!" } },
  });

  return (
    <div>
      <p>Status: {j.status}</p>
      <button onClick={j.toggleEditMode}>
        {j.editMode ? "✅ Editing" : "✏️ Edit Mode"}
      </button>
      <h1 data-copy="home.title">{j.data.home?.title}</h1>
      <p data-copy="home.subtitle">{j.data.home?.subtitle}</p>
    </div>
  );
}
```

## API

### `useJsonify(options?)`

The primary hook — combines WebSocket sync with `data-copy` attribute scanning and contentEditable.

| Option             | Type                          | Default                | Description                          |
| ------------------ | ----------------------------- | ---------------------- | ------------------------------------ |
| `url`              | `string`                      | `WSL_URL` env          | WebSocket server URL                 |
| `autoConnect`      | `boolean`                     | `false`                | Connect on mount                     |
| `initialData`      | `Record<string, JsonValue>`   | `{}`                   | Initial JSON state                   |
| `reconnectionDelay`| `number`                      | `3000`                 | Reconnection delay (ms)              |
| `onSync`           | `(data) => void`              | —                      | Callback on remote data received     |
| `onStatusChange`   | `(status) => void`            | —                      | Callback on connection status change |
| `onError`          | `(error) => void`             | —                      | Callback on connection error         |
| `targetDocument`   | `Document`                    | `window.document`      | Target document for data-copy scan   |
| `injectToggle`     | `boolean`                     | `true`                 | Auto-inject floating edit button     |

**Returns:**

| Property         | Type                             | Description                    |
| ---------------- | -------------------------------- | ------------------------------ |
| `data`           | `Record<string, JsonValue>`      | Current synced JSON data       |
| `setData`        | `(data) => void`                 | Update all data (broadcasts)   |
| `setPath`        | `(path, value) => void`          | Update a single dot-path       |
| `status`         | `WsStatus`                       | Connection status              |
| `connect`        | `(url?) => void`                 | Connect to server              |
| `disconnect`     | `() => void`                     | Disconnect from server         |
| `url`            | `string`                         | Resolved WebSocket URL         |
| `editMode`       | `boolean`                        | Whether edit mode is active    |
| `toggleEditMode` | `() => void`                     | Toggle edit mode on/off        |
| `setEditMode`    | `(active) => void`               | Set edit mode explicitly       |
| `elements`       | `DataCopyElement[]`              | Scanned data-copy elements     |
| `rescan`         | `() => void`                     | Re-scan for data-copy elements |

---

### `useJsonifyWs(options?)`

Lower-level hook — WebSocket sync only (no data-copy support).

| Option             | Type                          | Default                | Description                          |
| ------------------ | ----------------------------- | ---------------------- | ------------------------------------ |
| `url`              | `string`                      | `WSL_URL` env          | WebSocket server URL                 |
| `autoConnect`      | `boolean`                     | `false`                | Connect on mount                     |
| `initialData`      | `JsonValue`                   | `{}`                   | Initial JSON state                   |
| `reconnectionDelay`| `number`                      | `3000`                 | Reconnection delay (ms)              |
| `onSync`           | `(data: JsonValue) => void`   | —                      | Callback on remote data received     |
| `onStatusChange`   | `(status: WsStatus) => void`  | —                      | Callback on connection status change |
| `onError`          | `(error: Error) => void`      | —                      | Callback on connection error         |

**Returns:**

| Property     | Type                          | Description                    |
| ------------ | ----------------------------- | ------------------------------ |
| `data`       | `JsonValue`                   | Current synced JSON data       |
| `setData`    | `(data: JsonValue) => void`   | Update data (broadcasts)       |
| `status`     | `WsStatus`                    | `"disconnected" \| "connecting" \| "connected"` |
| `connect`    | `(url?: string) => void`      | Connect to server              |
| `disconnect` | `() => void`                  | Disconnect from server         |
| `url`        | `string`                      | Resolved WebSocket URL         |

---

### `createJsonifyServer(port?, corsOrigin?)`

Creates a Socket.IO server that broadcasts JSON updates between clients.

```ts
import { createJsonifyServer } from "jsonify-ws/server";

const io = createJsonifyServer(4000, "*");
```

---

## `data-copy` Attribute System

Add `data-copy` attributes to any HTML element to map it to a JSON path:

```html
<h1 data-copy="home.hero.title">Welcome</h1>
<p data-copy="home.hero.subtitle">This is editable</p>
<span data-copy="footer.copyright">© 2026</span>
```

When **Edit Mode** is activated:
1. Elements with `data-copy` get a dashed outline and become `contentEditable`
2. Text changes are synced to the JSON data in real-time
3. JSON changes (from other clients) update the element text automatically
4. A floating "✏️ Edit Mode" button appears (configurable via `injectToggle`)

### Standalone utilities

```ts
import {
  scanDataCopyElements,
  enableEditMode,
  disableEditMode,
  syncElementsFromData,
  getByPath,
  setByPath,
} from "jsonify-ws";

// Scan for elements
const elements = scanDataCopyElements(document);

// Enable editing
enableEditMode(elements);

// Sync JSON data to elements
syncElementsFromData(elements, { home: { title: "Updated!" } });

// Path utilities
const val = getByPath({ a: { b: "hello" } }, "a.b"); // "hello"
const updated = setByPath({ a: { b: "hello" } }, "a.b", "world"); // { a: { b: "world" } }
```

## How It Works

1. Client connects and pushes its current JSON state
2. Server stores latest state and syncs to all other clients
3. Any `setData()` or `setPath()` call broadcasts the update to all peers
4. New clients receive the latest state on connect
5. `data-copy` elements are scanned and mapped to JSON paths
6. In edit mode, contentEditable changes are captured and synced in real-time

## License

MIT
