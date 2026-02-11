import { ArrowLeft, Braces, Check, Copy, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative group rounded-lg border border-border bg-muted/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/80">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-foreground scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight mb-4 text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick Start" },
  { id: "server-setup", label: "Server Setup" },
  { id: "client-integration", label: "Client Integration" },
  { id: "react-hook", label: "React Hook API" },
  { id: "vanilla-js", label: "Vanilla JS / Any Framework" },
  { id: "protocol", label: "WebSocket Protocol" },
  { id: "config", label: "Configuration" },
  { id: "ai-prompt", label: "AI Prompt" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const Docs = () => {
  const [activeSection, setActiveSection] = useState(tocItems[0].id);

  // Set Active Tab Title when clicked on the tab or scrolling to the section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add some offset for better section detection
      let currentSectionId = tocItems[0].id; // Default to first section
      for (const item of tocItems) {
        const section = document.getElementById(item.id);
        if (section && section.offsetTop <= scrollPosition) {
          currentSectionId = item.id;
        }
      }
      setActiveSection(currentSectionId);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTabClick = (id: string) => {
    // smooth scroll to section when clicking on the tab
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Braces className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-semibold tracking-tight">Jsonify</h1>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Docs
          </span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar TOC */}
        <nav className="hidden lg:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4 border-r border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            On this page
          </p>
          <ul className="space-y-1">
            {tocItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block text-sm py-1 px-2 rounded transition-colors ${
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabClick(item.id);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-10 px-6 lg:px-12 space-y-12 max-w-4xl">
          {/* Hero */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Documentation
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Learn how to set up the Jsonify WebSocket server and integrate
              real-time JSON syncing into your website or application.
            </p>
          </div>

          {/* Overview */}
          <Section id="overview" title="Overview">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Jsonify provides a lightweight WebSocket server that keeps your
                JSON content in sync across multiple clients in real time. When
                you edit content in one browser tab, every other connected tab
                instantly receives the update.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: "Real-time Sync",
                    desc: "Changes broadcast instantly to all connected clients",
                  },
                  {
                    title: "Offline-first",
                    desc: "Data persists in localStorage — works without server",
                  },
                  {
                    title: "Zero Config",
                    desc: "Start the server, click Connect — that's it",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <p className="text-sm font-medium text-foreground mb-1">
                      {f.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-loose">
                <pre>{`┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│  Client A   │◄─────►│  WebSocket Server │◄─────►│  Client B   │
│  (Browser)  │ ws:// │  (ws-server.ts)   │ ws:// │  (Browser)  │
└─────────────┘       └──────────────────┘       └─────────────┘`}</pre>
              </div>
            </div>
          </Section>

          {/* Quick Start */}
          <Section id="quick-start" title="Quick Start">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Get up and running in under 2 minutes:</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    1. Install dependencies
                  </p>
                  <CodeBlock code="npm install" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    2. Start the WebSocket server
                  </p>
                  <CodeBlock code="npm run ws:server" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    3. Start the development server (in a separate terminal)
                  </p>
                  <CodeBlock code="npm run dev" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    4. Connect
                  </p>
                  <p>
                    Open the app in your browser and click the{" "}
                    <strong className="text-foreground">Connect</strong> button
                    in the header. The status dot turns green when connected.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    5. Test real-time sync
                  </p>
                  <p>
                    Open a second browser tab. Click Connect there too. Edit
                    JSON in either tab — changes appear instantly in the other.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Server Setup */}
          <Section id="server-setup" title="Server Setup">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The WebSocket server is a standalone Node.js script located at{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  server/ws-server.ts
                </code>
                .
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Start the server
                </p>
                <CodeBlock code="npm run ws:server" />
                <p className="mt-2">
                  Output:{" "}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    [ws] WebSocket server running on ws://localhost:4000
                  </code>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Custom port
                </p>
                <CodeBlock
                  code={`# Linux / macOS
WS_PORT=8080 npm run ws:server

# Windows (PowerShell)
$env:WS_PORT=8080; npm run ws:server

# Windows (CMD)
set WS_PORT=8080 && npm run ws:server`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Server source
                </p>
                <CodeBlock
                  language="typescript"
                  code={`import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.WS_PORT) || 4000;
const wss = new WebSocketServer({ port: PORT });

let latestData: unknown = null;
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);

  // Send current state to new client
  if (latestData !== null) {
    ws.send(JSON.stringify({ type: "sync", data: latestData }));
  }

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === "update") {
      latestData = msg.data;
      // Broadcast to all OTHER clients
      Array.from(clients).forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "sync", data: latestData }));
        }
      });
    }
  });

  ws.on("close", () => clients.delete(ws));
});

console.log(\`[ws] Server running on ws://localhost:\${PORT}\`);`}
                />
              </div>

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                  ⚠ Note
                </p>
                <p className="text-xs text-muted-foreground">
                  The server stores data <strong>in memory only</strong>.
                  Restarting the server clears the state. Clients persist data
                  in localStorage independently, so the first client to
                  reconnect will re-push its data.
                </p>
              </div>
            </div>
          </Section>

          {/* Client Integration */}
          <Section id="client-integration" title="Client Integration">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                There are two ways to integrate Jsonify sync into your website:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="#react-hook"
                  className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors block"
                >
                  <p className="text-sm font-medium text-foreground mb-1">
                    React Hook
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drop-in{" "}
                    <code className="bg-muted px-1 rounded text-[11px]">
                      useWebSocket
                    </code>{" "}
                    hook for React apps
                  </p>
                </a>
                <a
                  href="#vanilla-js"
                  className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors block"
                >
                  <p className="text-sm font-medium text-foreground mb-1">
                    Vanilla JS / Any Framework
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connect with native WebSocket API — works everywhere
                  </p>
                </a>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Install the{" "}
                  <code className="bg-muted px-1 rounded text-[11px]">ws</code>{" "}
                  package (server-side only)
                </p>
                <CodeBlock code={`npm install ws\nnpm install -D @types/ws`} />
                <p className="mt-2 text-xs">
                  The browser has a built-in{" "}
                  <code className="bg-muted px-1 rounded text-[11px]">
                    WebSocket
                  </code>{" "}
                  API — no client-side packages needed.
                </p>
              </div>
            </div>
          </Section>

          {/* React Hook */}
          <Section id="react-hook" title="React Hook API">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Copy{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  src/hooks/useWebSocket.ts
                </code>{" "}
                into your project.
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Basic usage
                </p>
                <CodeBlock
                  language="tsx"
                  code={`import { useWebSocket } from "./hooks/useWebSocket";
import { useState, useCallback } from "react";

function App() {
  const [data, setData] = useState({ title: "Hello World" });

  const handleRemoteUpdate = useCallback((incoming) => {
    setData(incoming);
  }, []);

  const ws = useWebSocket(data, handleRemoteUpdate);

  return (
    <div>
      {/* Status indicator */}
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: ws.status === "connected" ? "#22c55e"
          : ws.status === "connecting" ? "#eab308" : "#888",
        display: "inline-block"
      }} />

      {/* Connect / Disconnect */}
      {ws.status === "connected" ? (
        <button onClick={ws.disconnect}>Disconnect</button>
      ) : (
        <button onClick={() => ws.connect(ws.wsUrl)}>Connect</button>
      )}

      {/* Your editor */}
      <input
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />
    </div>
  );
}`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Full hook source — copy this into your project
                </p>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 mb-3">
                  <p className="text-xs text-muted-foreground">
                    Create a file at{" "}
                    <code className="bg-muted px-1 rounded font-mono text-[11px]">
                      src/hooks/useWebSocket.ts
                    </code>{" "}
                    and paste the code below. This is the complete hook — no
                    other dependencies needed beyond React.
                  </p>
                </div>
                <CodeBlock
                  language="typescript"
                  code={`import { useCallback, useEffect, useRef, useState } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type WsStatus = "disconnected" | "connecting" | "connected";

const DEFAULT_WS_URL = "ws://localhost:4000";
const RECONNECT_DELAY = 3000;

export function useWebSocket(
  data: JsonValue,
  onRemoteUpdate: (data: JsonValue) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
  const isRemoteUpdate = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabled = useRef(false);

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const connect = useCallback(
    (url: string) => {
      cleanup();
      enabled.current = true;
      setStatus("connecting");

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        console.log("[ws] Connected to", url);
        ws.send(JSON.stringify({ type: "update", data }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "sync" && msg.data !== undefined) {
            isRemoteUpdate.current = true;
            onRemoteUpdate(msg.data);
          }
        } catch (err) {
          console.error("[ws] Failed to parse message:", err);
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
        if (enabled.current) {
          reconnectTimer.current = setTimeout(
            () => connect(url),
            RECONNECT_DELAY,
          );
        }
      };

      ws.onerror = (err) => {
        console.error("[ws] Error:", err);
        ws.close();
      };
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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "update", data }));
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
}`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Hook parameters
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Parameter
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Type
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="px-4 py-2 font-mono">data</td>
                        <td className="px-4 py-2 font-mono">JsonValue</td>
                        <td className="px-4 py-2">
                          Current JSON state — auto-sent on changes
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono">onRemoteUpdate</td>
                        <td className="px-4 py-2 font-mono">
                          (data) =&gt; void
                        </td>
                        <td className="px-4 py-2">
                          Callback when a remote client pushes changes
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Return values
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Property
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Type
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="px-4 py-2 font-mono">status</td>
                        <td className="px-4 py-2 font-mono">
                          "disconnected" | "connecting" | "connected"
                        </td>
                        <td className="px-4 py-2">Current connection state</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-4 py-2 font-mono">wsUrl</td>
                        <td className="px-4 py-2 font-mono">string</td>
                        <td className="px-4 py-2">
                          WebSocket URL (default: ws://localhost:4000)
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-4 py-2 font-mono">setWsUrl</td>
                        <td className="px-4 py-2 font-mono">
                          (url) =&gt; void
                        </td>
                        <td className="px-4 py-2">
                          Update the URL before connecting
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-4 py-2 font-mono">connect</td>
                        <td className="px-4 py-2 font-mono">
                          (url) =&gt; void
                        </td>
                        <td className="px-4 py-2">
                          Start WebSocket connection
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono">disconnect</td>
                        <td className="px-4 py-2 font-mono">() =&gt; void</td>
                        <td className="px-4 py-2">
                          Close connection and stop auto-reconnect
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          {/* Vanilla JS */}
          <Section id="vanilla-js" title="Vanilla JS / Any Framework">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                No framework needed. Use the browser's built-in{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  WebSocket
                </code>{" "}
                API:
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Connect and sync
                </p>
                <CodeBlock
                  language="javascript"
                  code={`const ws = new WebSocket("ws://localhost:4000");

// Receive updates from other clients
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "sync") {
    console.log("Remote update:", msg.data);
    // Update your UI with msg.data
    renderContent(msg.data);
  }
};

// Send your local changes to the server
function pushUpdate(data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "update", data }));
  }
}

// Example: push on form change
document.querySelector("#editor").addEventListener("input", (e) => {
  const data = { title: e.target.value };
  pushUpdate(data);
});

ws.onopen = () => console.log("Connected");
ws.onclose = () => console.log("Disconnected");`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  With auto-reconnect
                </p>
                <CodeBlock
                  language="javascript"
                  code={`function createSyncClient(url, onData) {
  let ws;

  function connect() {
    ws = new WebSocket(url);
    ws.onopen = () => console.log("[sync] Connected");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "sync") onData(msg.data);
    };
    ws.onclose = () => {
      console.log("[sync] Disconnected, retrying in 3s...");
      setTimeout(connect, 3000);
    };
  }

  connect();

  return {
    push(data) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "update", data }));
      }
    },
    close() { ws?.close(); }
  };
}

// Usage
const sync = createSyncClient("ws://localhost:4000", (data) => {
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
});

// Push changes
sync.push({ greeting: "Hello from Vanilla JS!" });`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Fetch JSON via REST (read-only)
                </p>
                <p>
                  If you just need to <strong>read</strong> the latest JSON
                  without real-time sync, you can fetch from your exported JSON
                  endpoint or file.
                </p>
                <CodeBlock
                  language="javascript"
                  code={`// If you've exported your JSON to a static file or API:
const res = await fetch("https://your-site.com/content.json");
const data = await res.json();

document.querySelector("h1").textContent = data.home.hero.title;
document.querySelector("p").textContent = data.home.hero.subtitle;`}
                />
              </div>
            </div>
          </Section>

          {/* Protocol */}
          <Section id="protocol" title="WebSocket Protocol">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Simple JSON messages over WebSocket:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    Client → Server
                  </p>
                  <CodeBlock
                    language="json"
                    code={`{
  "type": "update",
  "data": {
    "home": {
      "hero": { "title": "Hello" }
    }
  }
}`}
                  />
                  <p className="text-xs mt-2">
                    Sent when the user edits content locally, or on first
                    connect.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    Server → Client
                  </p>
                  <CodeBlock
                    language="json"
                    code={`{
  "type": "sync",
  "data": {
    "home": {
      "hero": { "title": "Hello" }
    }
  }
}`}
                  />
                  <p className="text-xs mt-2">
                    Broadcast when another client pushes an update, or sent to a
                    newly connected client.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium text-foreground mb-2">
                  Message flow
                </p>
                <ol className="text-xs space-y-1 list-decimal list-inside">
                  <li>
                    Client A edits JSON → sends{" "}
                    <code className="bg-muted px-1 rounded">update</code> to
                    server
                  </li>
                  <li>Server stores data in memory</li>
                  <li>
                    Server sends{" "}
                    <code className="bg-muted px-1 rounded">sync</code> to
                    Client B, C, D…
                  </li>
                  <li>Each client updates its local state & localStorage</li>
                </ol>
              </div>
            </div>
          </Section>

          {/* Config */}
          <Section id="config" title="Configuration">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium text-foreground">
                        Setting
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-foreground">
                        Default
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-foreground">
                        How to change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Server port</td>
                      <td className="px-4 py-2 font-mono">4000</td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">WS_PORT</code>{" "}
                        env variable
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Client URL</td>
                      <td className="px-4 py-2 font-mono">
                        ws://localhost:4000
                      </td>
                      <td className="px-4 py-2">
                        Header URL input or{" "}
                        <code className="bg-muted px-1 rounded">
                          DEFAULT_WS_URL
                        </code>{" "}
                        in useWebSocket.ts
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Reconnect delay</td>
                      <td className="px-4 py-2 font-mono">3000ms</td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">
                          RECONNECT_DELAY
                        </code>{" "}
                        in useWebSocket.ts
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">LocalStorage key</td>
                      <td className="px-4 py-2 font-mono">
                        copy-canvas-json-data
                      </td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">
                          STORAGE_KEY
                        </code>{" "}
                        in useJsonEditor.ts
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* AI Prompt */}
          <Section id="ai-prompt" title="AI Prompt for Integration">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Copy and paste this prompt into ChatGPT, Claude, Copilot, or any
                AI assistant to have it integrate the Jsonify WebSocket sync
                into your existing website:
              </p>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary mb-2">
                  💡 How to use
                </p>
                <ol className="text-xs space-y-1 list-decimal list-inside">
                  <li>Copy the prompt below</li>
                  <li>Paste it into your AI assistant</li>
                  <li>
                    Replace the placeholder values (your WebSocket URL, data
                    structure, etc.)
                  </li>
                  <li>
                    The AI will generate the integration code for your specific
                    framework
                  </li>
                </ol>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Prompt for any framework
                </p>
                <CodeBlock
                  language="text"
                  code={`I need to integrate a WebSocket-based real-time JSON sync into my website. Here are the details:

WebSocket Server:
- The server runs on ws://localhost:4000 (configurable via WS_PORT env variable)
- It accepts JSON messages and broadcasts changes to all connected clients
- Protocol uses two message types:
  1. Client → Server: { "type": "update", "data": <full JSON object> }
  2. Server → Client: { "type": "sync", "data": <full JSON object> }

Behavior:
- When a client connects, the server sends the current state via a "sync" message
- When a client sends an "update" message, the server stores it and broadcasts a "sync" to all OTHER clients
- The client should auto-reconnect on disconnect (retry every 3 seconds)
- Local changes should be sent to the server immediately
- Remote changes (received via "sync") should update the UI without triggering a send back

My website uses: [YOUR FRAMEWORK: e.g. React, Vue, Next.js, Svelte, plain HTML/JS, etc.]
My content data structure looks like:
[PASTE YOUR JSON STRUCTURE HERE, e.g.:
{
  "home": {
    "hero": { "title": "...", "subtitle": "...", "cta": "..." },
    "features": [{ "title": "...", "description": "..." }]
  },
  "about": { "heading": "...", "description": "..." }
}]

Please generate:
1. A reusable WebSocket client module/hook for my framework
2. Integration code showing how to connect it to my existing components
3. A connection status indicator (connected/connecting/disconnected)
4. Auto-reconnect logic
5. localStorage persistence as offline fallback

The WebSocket server is already running. I just need the client-side code.`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Prompt for React (specific)
                </p>
                <CodeBlock
                  language="text"
                  code={`Add real-time WebSocket sync to my React app. Here's what I need:

Create a useWebSocket hook that:
- Connects to ws://localhost:4000
- Takes two parameters: (data: any, onRemoteUpdate: (data: any) => void)
- Returns: { status: "disconnected" | "connecting" | "connected", wsUrl: string, setWsUrl, connect, disconnect }
- Sends { type: "update", data } to the server whenever \`data\` changes
- Listens for { type: "sync", data } messages and calls onRemoteUpdate
- Uses a ref flag to prevent echoing remote updates back to the server
- Auto-reconnects every 3 seconds on disconnect
- Cleans up on unmount

Then show me how to use it in my component:

const [data, setData] = useState(myInitialData);
const handleRemoteUpdate = useCallback((incoming) => setData(incoming), []);
const ws = useWebSocket(data, handleRemoteUpdate);

Also add a status indicator dot in the header:
- Green when connected
- Yellow pulsing when connecting  
- Gray when disconnected
- Connect/Disconnect button
- Editable URL input field

My data structure is:
[PASTE YOUR JSON HERE]`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Prompt for Vue / Nuxt
                </p>
                <CodeBlock
                  language="text"
                  code={`Add real-time WebSocket sync to my Vue/Nuxt app.

Create a composable useWebSocket that:
- Connects to ws://localhost:4000  
- Accepts a reactive data ref and an onRemoteUpdate callback
- Returns reactive status, wsUrl, connect(), disconnect()
- Watches the data ref and sends { type: "update", data } on changes
- Listens for { type: "sync", data } and calls onRemoteUpdate
- Skips sending when the change came from a remote sync (use a flag)
- Auto-reconnects every 3 seconds
- Cleans up on onUnmounted

Show integration in a component with:
- Status indicator (green/yellow/gray dot)
- URL input + Connect/Disconnect button
- Two-way binding with my content data

My data structure is:
[PASTE YOUR JSON HERE]`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Prompt for plain HTML / Vanilla JS
                </p>
                <CodeBlock
                  language="text"
                  code={`Add real-time WebSocket sync to my static HTML website.

Create a JavaScript module that:
- Connects to ws://localhost:4000
- Provides: connect(url), disconnect(), push(data), onData(callback)
- Auto-reconnects every 3 seconds on disconnect
- Sends { type: "update", data } when push() is called
- Calls the onData callback when a { type: "sync", data } message arrives
- Tracks connection status: "disconnected" | "connecting" | "connected"

Show me:
1. The sync module (plain ES6, no build tools required)
2. HTML with a status dot, URL input, and connect button
3. How to bind it to DOM elements (e.g., update an h1 and p tag from the JSON)
4. How to push changes from a form/input back to the server

My content JSON looks like:
[PASTE YOUR JSON HERE]`}
                />
              </div>

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                  ⚠ Remember
                </p>
                <p className="text-xs text-muted-foreground">
                  Replace{" "}
                  <code className="bg-muted px-1 rounded">
                    [PASTE YOUR JSON HERE]
                  </code>{" "}
                  with your actual data structure from the JSON Preview panel,
                  and{" "}
                  <code className="bg-muted px-1 rounded">
                    [YOUR FRAMEWORK]
                  </code>{" "}
                  with your tech stack. The more context you give the AI, the
                  better the generated code will be.
                </p>
              </div>
            </div>
          </Section>

          {/* Troubleshooting */}
          <Section id="troubleshooting" title="Troubleshooting">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              {[
                {
                  q: "Connection fails (status stays gray)",
                  a: [
                    "Ensure the WebSocket server is running: npm run ws:server",
                    "Check the URL matches (default ws://localhost:4000)",
                    "Verify the port isn't blocked by a firewall",
                  ],
                },
                {
                  q: "Status stays yellow (connecting)",
                  a: [
                    "Server may not be running",
                    "Check if port is in use: netstat -ano | findstr :4000 (Windows) or lsof -i :4000 (macOS/Linux)",
                  ],
                },
                {
                  q: "Changes not syncing between tabs",
                  a: [
                    "Both tabs must show a green status dot",
                    "Open browser DevTools console — look for [ws] log messages",
                    "Ensure both tabs are connected to the same server URL",
                  ],
                },
                {
                  q: "Data resets when server restarts",
                  a: [
                    "The server stores data in memory only — this is by design",
                    "The first client to reconnect will re-push its localStorage data",
                    "For persistent server storage, add a database or file write to ws-server.ts",
                  ],
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="text-sm font-medium text-foreground mb-2">
                    {item.q}
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    {item.a.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-border pt-8 pb-16">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>Jsonify Documentation</p>
              <Link to="/" className="text-primary hover:underline">
                ← Back to editor
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;
