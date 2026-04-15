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
  { id: "npm-package", label: "NPM Package" },
  { id: "use-jsonify", label: "useJsonify() Hook" },
  { id: "data-copy", label: "data-copy Attributes" },
  { id: "server-setup", label: "Server Setup" },
  { id: "client-integration", label: "Client Integration" },
  { id: "react-hook", label: "useJsonifyWs Hook" },
  { id: "vanilla-js", label: "Vanilla JS / Any Framework" },
  { id: "protocol", label: "Socket.IO Events" },
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
              Learn how to set up the Jsonify Socket.IO server and integrate
              real-time JSON syncing into your website or application.
            </p>
          </div>

          {/* Overview */}
          <Section id="overview" title="Overview">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Jsonify provides a lightweight Socket.IO server that keeps your
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
│  Client A   │◄─────►│  Socket.IO Server │◄─────►│  Client B   │
│  (Browser)  │ http: │  (ws-server.ts)   │ http: │  (Browser)  │
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
                    2. Start the Socket.IO server
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

          {/* NPM Package */}
          <Section id="npm-package" title="NPM Package">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Install the{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  @coderegtech/jsonify-ws
                </code>{" "}
                npm package to add real-time JSON sync and{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  data-copy
                </code>{" "}
                content editing to any React app.
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Install
                </p>
                <CodeBlock
                  code={`npm install @coderegtech/jsonify-ws socket.io-client`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  WebSocket URL
                </p>
                <CodeBlock
                  language="env"
                  code={`# .env (Vite)
VITE_WSL_URL=http://localhost:4000

# .env (CRA / Next.js)
REACT_APP_WSL_URL=http://localhost:4000

# Fallback
WSL_URL=http://localhost:4000`}
                />
                <p className="mt-2 text-xs">
                  If not set, defaults to{" "}
                  <code className="bg-muted px-1 rounded font-mono text-[11px]">
                    http://localhost:4000
                  </code>
                  .
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Edit Mode
                </p>
                <CodeBlock
                  language="env"
                  code={`# .env (Vite)
VITE_EDIT_MODE=true

# .env (CRA / Next.js)
REACT_APP_EDIT_MODE=true

# Or set directly
EDIT_MODE=true`}
                />
                <p className="mt-2 text-xs">
                  Set{" "}
                  <code className="bg-muted px-1 rounded font-mono text-[11px]">
                    EDIT_MODE=true
                  </code>{" "}
                  to enable inline content editing. When not set or{" "}
                  <code className="bg-muted px-1 rounded font-mono text-[11px]">
                    false
                  </code>
                  , edit features are disabled (no toggle button, no
                  contentEditable).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    useJsonify()
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Full-featured hook with WebSocket sync +{" "}
                    <code className="bg-muted px-1 rounded text-[11px]">
                      data-copy
                    </code>{" "}
                    contentEditable
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    useJsonifyWs()
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lower-level hook — WebSocket sync only (no data-copy
                    support)
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* useJsonify Hook */}
          <Section id="use-jsonify" title="useJsonify() Hook">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The primary hook — combines WebSocket sync with{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  data-copy
                </code>{" "}
                attribute scanning and contentEditable mode.
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Basic usage
                </p>
                <CodeBlock
                  language="tsx"
                  code={`import { useJsonify } from "@coderegtech/jsonify-ws";

function App() {
  const j = useJsonify({
    autoConnect: true,
    initialData: {
      home: { title: "Hello World", subtitle: "Edit me!" }
    },
  });

  return (
    <div>
      <p>Status: {j.status}</p>

      {/* Toggle edit mode — makes data-copy elements editable */}
      <button onClick={j.toggleEditMode}>
        {j.editMode ? "✅ Editing" : "✏️ Edit Mode"}
      </button>

      {/* Elements with data-copy become contentEditable in edit mode */}
      <h1 data-copy="home.title">{j.data.home?.title}</h1>
      <p data-copy="home.subtitle">{j.data.home?.subtitle}</p>

      {/* Direct data manipulation */}
      <button onClick={() => j.setPath("home.title", "Updated!")}>
        Update Title
      </button>
    </div>
  );
}`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Options
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Option
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Type
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Default
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        [
                          "url",
                          "string",
                          "WSL_URL env",
                          "WebSocket server URL",
                        ],
                        ["autoConnect", "boolean", "false", "Connect on mount"],
                        [
                          "initialData",
                          "Record<string, JsonValue>",
                          "{}",
                          "Initial JSON state",
                        ],
                        [
                          "reconnectionDelay",
                          "number",
                          "3000",
                          "Reconnection delay (ms)",
                        ],
                        [
                          "onSync",
                          "(data) => void",
                          "—",
                          "Callback on remote data received",
                        ],
                        [
                          "onStatusChange",
                          "(status) => void",
                          "—",
                          "Callback on status change",
                        ],
                        [
                          "onError",
                          "(error) => void",
                          "—",
                          "Callback on error",
                        ],
                        [
                          "targetDocument",
                          "Document",
                          "window.document",
                          "Target for data-copy scan",
                        ],
                        [
                          "injectToggle",
                          "boolean",
                          "EDIT_MODE env",
                          "Auto-inject floating edit button (only if EDIT_MODE=true)",
                        ],
                        [
                          "injectStatusIndicator",
                          "boolean",
                          "false",
                          "Auto-inject WS status indicator (bottom-left)",
                        ],
                        [
                          "persistEditMode",
                          "boolean",
                          "true",
                          "Persist edit mode state in localStorage",
                        ],
                      ].map(([name, type, def, desc]) => (
                        <tr key={name} className="border-b border-border">
                          <td className="px-4 py-2 font-mono">{name}</td>
                          <td className="px-4 py-2 font-mono text-[11px]">
                            {type}
                          </td>
                          <td className="px-4 py-2 font-mono text-[11px]">
                            {def}
                          </td>
                          <td className="px-4 py-2">{desc}</td>
                        </tr>
                      ))}
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
                      {[
                        [
                          "data",
                          "Record<string, JsonValue>",
                          "Current synced JSON data",
                        ],
                        [
                          "setData",
                          "(data) => void",
                          "Update all data (broadcasts)",
                        ],
                        [
                          "setPath",
                          "(path, value) => void",
                          "Update a single dot-path",
                        ],
                        ["status", "WsStatus", "Connection status"],
                        ["connect", "(url?) => void", "Connect to server"],
                        ["disconnect", "() => void", "Disconnect from server"],
                        ["url", "string", "Resolved WebSocket URL"],
                        ["editMode", "boolean", "Whether edit mode is active"],
                        [
                          "toggleEditMode",
                          "() => void",
                          "Toggle edit mode on/off",
                        ],
                        [
                          "setEditMode",
                          "(active) => void",
                          "Set edit mode explicitly",
                        ],
                        [
                          "elements",
                          "DataCopyElement[]",
                          "Scanned data-copy elements",
                        ],
                        [
                          "rescan",
                          "() => void",
                          "Re-scan for data-copy elements",
                        ],
                      ].map(([name, type, desc]) => (
                        <tr key={name} className="border-b border-border">
                          <td className="px-4 py-2 font-mono">{name}</td>
                          <td className="px-4 py-2 font-mono text-[11px]">
                            {type}
                          </td>
                          <td className="px-4 py-2">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          {/* data-copy Attributes */}
          <Section id="data-copy" title="data-copy Attribute System">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Add{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  data-copy
                </code>{" "}
                attributes to any HTML element to map it to a JSON path. When
                Edit Mode is activated, these elements become contentEditable
                with real-time WebSocket sync.
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  HTML markup
                </p>
                <CodeBlock
                  language="html"
                  code={`<!-- Map elements to JSON paths using data-copy -->
<h1 data-copy="home.hero.title">Welcome to My Site</h1>
<p data-copy="home.hero.subtitle">This text is editable in real-time</p>
<span data-copy="footer.copyright">© 2026 MyCompany</span>

<!-- Nested paths work too -->
<div data-copy="about.team.lead.name">John Doe</div>`}
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium text-foreground mb-2">
                  How it works
                </p>
                <ol className="text-xs space-y-1.5 list-decimal list-inside">
                  <li>
                    Elements with{" "}
                    <code className="bg-muted px-1 rounded">data-copy</code> are
                    scanned on mount
                  </li>
                  <li>
                    When <strong>Edit Mode</strong> is activated (toggle button
                    or{" "}
                    <code className="bg-muted px-1 rounded">
                      toggleEditMode()
                    </code>
                    ), elements become{" "}
                    <code className="bg-muted px-1 rounded">
                      contentEditable
                    </code>
                  </li>
                  <li>A dashed outline highlights editable elements</li>
                  <li>
                    Text changes fire{" "}
                    <code className="bg-muted px-1 rounded">input</code> events
                    → synced to JSON via{" "}
                    <code className="bg-muted px-1 rounded">setPath()</code>
                  </li>
                  <li>
                    JSON changes from other WebSocket clients update element
                    text automatically
                  </li>
                  <li>
                    Deactivating Edit Mode removes contentEditable and outlines
                  </li>
                </ol>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Edit mode activation
                </p>
                <CodeBlock
                  language="tsx"
                  code={`// Option 1: Floating button (auto-injected when EDIT_MODE=true)
// A "✏️ Edit Mode" button appears in bottom-right corner
const j = useJsonify({ injectToggle: true }); // defaults to EDIT_MODE env

// Option 2: Custom button
const j = useJsonify({ injectToggle: false });

<button onClick={j.toggleEditMode}>
  {j.editMode ? "✅ Stop Editing" : "✏️ Edit Mode"}
</button>

// Option 3: Programmatic
j.setEditMode(true);  // activate
j.setEditMode(false); // deactivate`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Full example with WebSocket sync
                </p>
                <CodeBlock
                  language="tsx"
                  code={`import { useJsonify } from "@coderegtech/jsonify-ws";

function Website() {
  const j = useJsonify({
    url: process.env.VITE_WSL_URL,
    autoConnect: true,
    initialData: {
      home: {
        hero: { title: "Welcome", subtitle: "Edit anything" },
        features: { heading: "Our Features" },
      },
      footer: { copyright: "© 2026" },
    },
  });

  return (
    <div>
      {/* Status bar */}
      <nav>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: j.status === "connected" ? "#22c55e"
            : j.status === "connecting" ? "#eab308" : "#888",
          display: "inline-block"
        }} />
        <button onClick={j.toggleEditMode}>
          {j.editMode ? "✅ Editing" : "✏️ Edit"}
        </button>
      </nav>

      {/* All data-copy elements are editable in edit mode */}
      <section>
        <h1 data-copy="home.hero.title">{j.data.home?.hero?.title}</h1>
        <p data-copy="home.hero.subtitle">{j.data.home?.hero?.subtitle}</p>
      </section>

      <section>
        <h2 data-copy="home.features.heading">
          {j.data.home?.features?.heading}
        </h2>
      </section>

      <footer>
        <span data-copy="footer.copyright">{j.data.footer?.copyright}</span>
      </footer>
    </div>
  );
}`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Standalone utilities (no React required)
                </p>
                <CodeBlock
                  language="typescript"
                  code={`import {
  scanDataCopyElements,
  enableEditMode,
  disableEditMode,
  syncElementsFromData,
  getByPath,
  setByPath,
  injectEditToggle,
  injectWsStatusIndicator,
  isEditModeEnabled,
} from "@coderegtech/jsonify-ws";

// Check if EDIT_MODE env var is enabled
if (isEditModeEnabled()) {
  console.log("Edit mode is enabled!");
}

// Scan the document for data-copy elements
const elements = scanDataCopyElements(document);

// Enable/disable contentEditable
enableEditMode(elements);
disableEditMode(elements);

// Sync JSON data to element text content
syncElementsFromData(elements, { home: { title: "Updated!" } });

// Path utilities
getByPath({ a: { b: "hello" } }, "a.b");        // "hello"
setByPath({ a: { b: "hello" } }, "a.b", "world"); // { a: { b: "world" } }

// Inject floating toggle button
const cleanup = injectEditToggle(document, (active) => {
  if (active) enableEditMode(elements);
  else disableEditMode(elements);
});
cleanup(); // Remove toggle button

// Inject WebSocket status indicator (bottom-left)
const wsStatus = injectWsStatusIndicator(document);
wsStatus.updateStatus("connected"); // "disconnected" | "connecting" | "connected"
wsStatus.cleanup(); // Remove indicator`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  WebSocket Status Indicator
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Enable{" "}
                  <code className="bg-muted px-1 rounded">
                    injectStatusIndicator
                  </code>{" "}
                  to show a real-time connection status badge in the bottom-left
                  corner:
                </p>
                <CodeBlock
                  language="tsx"
                  code={`const j = useJsonify({
  autoConnect: true,
  injectStatusIndicator: true, // Shows status in bottom-left corner
});

// The indicator displays:
// 🔴 Red — Disconnected
// 🟡 Yellow (pulsing) — Connecting
// 🟢 Green — Connected`}
                />
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary mb-1">
                  💡 Tip: iframes
                </p>
                <p className="text-xs text-muted-foreground">
                  Pass an iframe's{" "}
                  <code className="bg-muted px-1 rounded">contentDocument</code>{" "}
                  as{" "}
                  <code className="bg-muted px-1 rounded">targetDocument</code>{" "}
                  to scan and edit elements inside an iframe.
                </p>
              </div>
            </div>
          </Section>

          <Section id="server-setup" title="Server Setup">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The Socket.IO server is located at{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  packages/jsonify-ws/src/server.ts
                </code>
                . It exports a{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  createJsonifyServer()
                </code>{" "}
                function.
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Start the server
                </p>
                <CodeBlock code="npm run ws:server" />
                <p className="mt-2">
                  Output:{" "}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    [jsonify-ws] Server running on http://localhost:4000
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
                  code={`// Option A: Programmatic
import { createJsonifyServer } from "@coderegtech/jsonify-ws/server";

const io = createJsonifyServer(4000, "*"); // port, cors origin

// Option B: Direct (equivalent to what createJsonifyServer does)
import { Server } from "socket.io";

const PORT = Number(process.env.WS_PORT) || 4000;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let latestData: unknown = null;

io.on("connection", (socket) => {
  console.log(\`[jsonify-ws] Client connected (\${io.engine.clientsCount} total)\`);

  if (latestData !== null) {
    socket.emit("sync", latestData);
  }

  socket.on("update", (data: unknown) => {
    latestData = data;
    socket.broadcast.emit("sync", latestData);
  });

  socket.on("disconnect", () => {
    console.log(\`[jsonify-ws] Client disconnected (\${io.engine.clientsCount} total)\`);
  });

  socket.on("error", (err) => {
    console.error("[jsonify-ws] Socket error:", err);
  });
});

console.log(\`[jsonify-ws] Server running on http://localhost:\${PORT}\`);`}
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
                    Connect with Socket.IO client — works everywhere
                  </p>
                </a>
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Install Socket.IO packages
                </p>
                <CodeBlock code={`npm install socket.io socket.io-client`} />
                <p className="mt-2 text-xs">
                  <code className="bg-muted px-1 rounded text-[11px]">
                    socket.io
                  </code>{" "}
                  is for the server,{" "}
                  <code className="bg-muted px-1 rounded text-[11px]">
                    socket.io-client
                  </code>{" "}
                  is for the browser client.
                </p>
              </div>
            </div>
          </Section>

          {/* React Hook */}
          <Section id="react-hook" title="useJsonifyWs Hook (Low-Level)">
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
                    and paste the code below. Requires{" "}
                    <code className="bg-muted px-1 rounded font-mono text-[11px]">
                      socket.io-client
                    </code>{" "}
                    package.
                  </p>
                </div>
                <CodeBlock
                  language="typescript"
                  code={`import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type WsStatus = "disconnected" | "connecting" | "connected";

const DEFAULT_WS_URL = "http://localhost:4000";

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
                          Socket.IO URL (default: http://localhost:4000)
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
                          Start Socket.IO connection
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
                Use the{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  socket.io-client
                </code>{" "}
                package for browser integration:
              </p>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Connect and sync
                </p>
                <CodeBlock
                  language="javascript"
                  code={`import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

// Receive updates from other clients
socket.on("sync", (data) => {
  console.log("Remote update:", data);
  // Update your UI with data
  renderContent(data);
});

// Send your local changes to the server
function pushUpdate(data) {
  socket.emit("update", data);
}

// Example: push on form change
document.querySelector("#editor").addEventListener("input", (e) => {
  const data = { title: e.target.value };
  pushUpdate(data);
});

socket.on("connect", () => console.log("Connected"));
socket.on("disconnect", () => console.log("Disconnected"));`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  With auto-reconnect (built-in)
                </p>
                <CodeBlock
                  language="javascript"
                  code={`import { io } from "socket.io-client";

function createSyncClient(url, onData) {
  const socket = io(url, {
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => console.log("[sync] Connected"));
  socket.on("sync", onData);
  socket.on("disconnect", () => console.log("[sync] Disconnected"));

  return {
    push(data) {
      socket.emit("update", data);
    },
    close() {
      socket.disconnect();
    }
  };
}

// Usage
const sync = createSyncClient("http://localhost:4000", (data) => {
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
          <Section id="protocol" title="Socket.IO Events">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Socket.IO events for communication:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">
                    Client → Server
                  </p>
                  <CodeBlock
                    language="typescript"
                    code={`// Event: "update"
socket.emit("update", {
  home: {
    hero: { title: "Hello" }
  }
});`}
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
                    language="typescript"
                    code={`// Event: "sync"
socket.on("sync", (data) => {
  // data = {
  //   home: {
  //     hero: { title: "Hello" }
  //   }
  // }
});`}
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
                    Client A edits JSON → emits{" "}
                    <code className="bg-muted px-1 rounded">update</code> event
                    to server
                  </li>
                  <li>Server stores data in memory</li>
                  <li>
                    Server broadcasts{" "}
                    <code className="bg-muted px-1 rounded">sync</code> event to
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
                        http://localhost:4000
                      </td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">WSL_URL</code>{" "}
                        env variable or{" "}
                        <code className="bg-muted px-1 rounded">url</code>{" "}
                        option
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Reconnect delay</td>
                      <td className="px-4 py-2 font-mono">3000ms</td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">
                          reconnectionDelay
                        </code>{" "}
                        option
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Edit mode</td>
                      <td className="px-4 py-2 font-mono">false</td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">EDIT_MODE</code>{" "}
                        env variable (VITE_EDIT_MODE / REACT_APP_EDIT_MODE)
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">Persist edit mode</td>
                      <td className="px-4 py-2 font-mono">true</td>
                      <td className="px-4 py-2">
                        <code className="bg-muted px-1 rounded">
                          persistEditMode
                        </code>{" "}
                        option (uses localStorage key{" "}
                        <code className="bg-muted px-1 rounded">
                          jsonify-edit-mode
                        </code>
                        )
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
                AI assistant to have it integrate the Jsonify Socket.IO sync
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
                    Replace the placeholder values (your Socket.IO URL, data
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
                  code={`I need to integrate a Socket.IO-based real-time JSON sync into my website. Here are the details:

Socket.IO Server:
- The server runs on http://localhost:4000 (configurable via WS_PORT env variable)
- It uses Socket.IO events to broadcast changes to all connected clients
- Events:
  1. Client → Server: socket.emit("update", data)
  2. Server → Client: socket.on("sync", callback)

Behavior:
- When a client connects, the server emits the current state via a "sync" event
- When a client emits an "update" event, the server stores it and broadcasts "sync" to all OTHER clients
- Socket.IO has built-in auto-reconnect (configure reconnectionDelay)
- Local changes should be emitted to the server immediately
- Remote changes (received via "sync") should update the UI without triggering an emit back

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
1. A reusable Socket.IO client module/hook for my framework
2. Integration code showing how to connect it to my existing components
3. A connection status indicator (connected/connecting/disconnected)
4. Auto-reconnect logic (built into Socket.IO)
5. localStorage persistence as offline fallback

The Socket.IO server is already running. I just need the client-side code.`}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Prompt for React (specific)
                </p>
                <CodeBlock
                  language="text"
                  code={`Add real-time Socket.IO sync to my React app. Here's what I need:

Create a useWebSocket hook that:
- Connects to http://localhost:4000 using socket.io-client
- Takes two parameters: (data: any, onRemoteUpdate: (data: any) => void)
- Returns: { status: "disconnected" | "connecting" | "connected", wsUrl: string, setWsUrl, connect, disconnect }
- Emits "update" event with data whenever \`data\` changes
- Listens for "sync" events and calls onRemoteUpdate
- Uses a ref flag to prevent echoing remote updates back to the server
- Uses Socket.IO built-in auto-reconnect (reconnectionDelay: 3000)
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
                  code={`Add real-time Socket.IO sync to my Vue/Nuxt app.

Create a composable useWebSocket that:
- Connects to http://localhost:4000 using socket.io-client
- Accepts a reactive data ref and an onRemoteUpdate callback
- Returns reactive status, wsUrl, connect(), disconnect()
- Watches the data ref and emits "update" event on changes
- Listens for "sync" events and calls onRemoteUpdate
- Skips emitting when the change came from a remote sync (use a flag)
- Uses Socket.IO built-in auto-reconnect
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
                  code={`Add real-time Socket.IO sync to my static HTML website.

Create a JavaScript module that:
- Connects to http://localhost:4000 using socket.io-client
- Provides: connect(url), disconnect(), push(data), onData(callback)
- Uses Socket.IO built-in auto-reconnect
- Emits "update" event when push() is called
- Calls the onData callback when a "sync" event arrives
- Tracks connection status: "disconnected" | "connecting" | "connected"

Show me:
1. The sync module using socket.io-client (can use CDN)
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
                    "Ensure the Socket.IO server is running: npm run ws:server",
                    "Check the URL matches (default http://localhost:4000)",
                    "Verify the port isn't blocked by a firewall",
                    "Check browser console for CORS errors",
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
                    "Open browser DevTools console — look for [socket.io] log messages",
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
