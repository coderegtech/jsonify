import { ExportPanel } from "@/components/ExportPanel";
import { JsonPreview } from "@/components/JsonPreview";
import { JsonTreeEditor } from "@/components/JsonTreeEditor";
import { WebsitePreview } from "@/components/WebsitePreview";
import { useEditorContext } from "@/contexts/JsonEditorContext";
import { StorageConfig, defaultStorageConfig } from "@/lib/storage-config";
import {
  BookOpen,
  Braces,
  Code2,
  Eye,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const {
    ws,
    rightTab,
    setRightTab,
    leftCollapsed,
    setLeftCollapsed,
    ...editor
  } = useEditorContext();
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(
    localStorage.getItem("storageConfig")
      ? JSON.parse(localStorage.getItem("storageConfig")!)
      : defaultStorageConfig,
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex flex-col md:flex-row gap-4 md:items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Braces className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-semibold tracking-tight">Jsonify</h1>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            v1.1.5
          </span>
          <Link
            to="/docs"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {/* WebSocket Controls */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                ws.status === "connected"
                  ? "bg-green-500"
                  : ws.status === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-muted-foreground/40"
              }`}
              title={`WebSocket: ${ws.status}`}
            />
            <input
              className="bg-input border border-border rounded px-2 py-0.5 text-xs font-mono w-44 focus:outline-none focus:ring-1 focus:ring-ring"
              value={ws.wsUrl}
              onChange={(e) => ws.setWsUrl(e.target.value)}
              placeholder="ws://localhost:4000"
            />
            {ws.status === "connected" ? (
              <button
                className="flex items-center gap-1 bg-destructive/15 text-destructive px-2 py-0.5 rounded hover:bg-destructive/25 transition-colors text-xs"
                onClick={ws.disconnect}
              >
                <Radio className="w-3 h-3" />
                Stop
              </button>
            ) : (
              <button
                className="flex items-center gap-1 bg-primary/15 text-primary px-2 py-0.5 rounded hover:bg-primary/25 transition-colors text-xs"
                onClick={() => ws.connect(ws.wsUrl)}
                disabled={ws.status === "connecting"}
              >
                <Radio className="w-3 h-3" />
                {ws.status === "connecting" ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>
          <span className="bg-muted px-2 py-0.5 rounded font-mono">
            {editor.historyIndex + 1}/{editor.historyCount} snapshots
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: JSON Tree Editor */}
        <div
          className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${
            leftCollapsed ? "w-0 overflow-hidden" : "max-w-2xl w-full"
          }`}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                JSON Tree Editor
              </span>
            </div>
            <button
              className="p-1 rounded hover:bg-accent transition-colors"
              onClick={() => setLeftCollapsed(true)}
            >
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonTreeEditor
              data={editor.data}
              searchQuery={editor.searchQuery}
              onUpdate={editor.updatePath}
              onDelete={editor.deletePath}
              onAdd={editor.addField}
              onDuplicate={editor.duplicateField}
              onRename={editor.renamePath}
              onSearch={editor.setSearch}
              onUndo={editor.undo}
              onRedo={editor.redo}
              canUndo={editor.canUndo}
              canRedo={editor.canRedo}
              onLoadJson={editor.loadJson}
              onSetData={editor.setData}
              storageConfig={storageConfig}
            />
          </div>
          <ExportPanel
            data={editor.data}
            storageConfig={storageConfig}
            onStorageConfigChange={setStorageConfig}
            onLoadData={editor.setData}
            clearData={() => editor.setData({})}
          />
        </div>

        {/* Collapsed toggle */}
        {leftCollapsed && (
          <button
            className="flex items-start pt-3 justify-center w-10 border-r border-border bg-card hover:bg-accent transition-colors"
            onClick={() => setLeftCollapsed(false)}
          >
            <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex items-center border-b border-border bg-card shrink-0">
            <button
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                rightTab === "preview"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setRightTab("preview")}
            >
              <Eye className="w-3.5 h-3.5" />
              JSON Preview
            </button>
            <button
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                rightTab === "website"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setRightTab("website")}
            >
              <Globe className="w-3.5 h-3.5" />
              Website Preview
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {rightTab === "preview" ? (
              <JsonPreview data={editor.data} />
            ) : (
              <WebsitePreview />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
