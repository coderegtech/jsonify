# jsonify-ws

Real-time JSON synchronization over WebSocket using Socket.IO. Provides a React hook for the client and a ready-to-run sync server.

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

### 2. Use the React hook

```tsx
import { useJsonifyWs } from "jsonify-ws";

function App() {
  const { data, setData, status, connect, disconnect } = useJsonifyWs({
    // url: "http://localhost:4000", // or use WSL_URL env
    autoConnect: true,
    initialData: { hello: "world" },
    onSync: (remoteData) => {
      console.log("Received update:", remoteData);
    },
  });

  return (
    <div>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => setData({ ...data, updated: Date.now() })}>
        Update
      </button>
    </div>
  );
}
```

## API

### `useJsonifyWs(options?)`

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

### `createJsonifyServer(port?, corsOrigin?)`

Creates a Socket.IO server that broadcasts JSON updates between clients.

```ts
import { createJsonifyServer } from "jsonify-ws/server";

const io = createJsonifyServer(4000, "*");
```

## How It Works

1. Client connects and pushes its current JSON state
2. Server stores latest state and syncs to all other clients
3. Any `setData()` call broadcasts the update to all peers
4. New clients receive the latest state on connect

## License

MIT
