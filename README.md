# Jsonify

A visual JSON editor with real-time WebSocket sync. Edit JSON content collaboratively across multiple browser tabs using Socket.IO.

## Features

- **Visual JSON Tree Editor** — Add, edit, delete, rename, and duplicate fields with undo/redo
- **Real-time Sync** — Changes broadcast instantly to all connected clients via Socket.IO
- **`data-copy` Attribute System** — Map HTML elements to JSON paths for inline contentEditable editing
- **Export Options** — Download JSON, copy to clipboard, send to API, or upload to file storage
- **Offline-first** — Data persists in localStorage, works without the server

## Quick Start

```sh
# Install dependencies
npm install

# Start the Socket.IO server
npm run ws:server

# Start the dev server (separate terminal)
npm run dev
```

Open the app, click **Connect** in the header, and start editing. Open a second tab to see real-time sync in action.

## NPM Package

The `@coderegtech/jsonify-ws` package provides React hooks and a sync server for integrating real-time JSON editing into any app.

```sh
npm install @coderegtech/jsonify-ws socket.io-client
```

See the [package README](packages/jsonify-ws/README.md) for full API docs.

## Tech Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Socket.IO

## License

MIT
