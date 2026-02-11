import { useState } from "react";
import { useJsonEditor } from "@/hooks/useJsonEditor";
import { JsonTreeEditor } from "@/components/JsonTreeEditor";
import { JsonPreview } from "@/components/JsonPreview";
import { WebsitePreview } from "@/components/WebsitePreview";
import { ExportPanel } from "@/components/ExportPanel";
import {
  Code2,
  Eye,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Braces,
} from "lucide-react";

type RightTab = "preview" | "website";

const Index = () => {
  const editor = useJsonEditor();
  const [rightTab, setRightTab] = useState<RightTab>("preview");
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Braces className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-semibold tracking-tight">
              CopyManager
            </h1>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            v1.0
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
            leftCollapsed ? "w-0 overflow-hidden" : "w-1/2 min-w-[360px]"
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
              onRename={editor.renamePath}
              onSearch={editor.setSearch}
              onUndo={editor.undo}
              onRedo={editor.redo}
              canUndo={editor.canUndo}
              canRedo={editor.canRedo}
              onLoadJson={editor.loadJson}
              onSetData={editor.setData}
            />
          </div>
          <ExportPanel data={editor.data} />
        </div>

        {/* Collapsed toggle */}
        {leftCollapsed && (
          <button
            className="flex items-center justify-center w-10 border-r border-border bg-card hover:bg-accent transition-colors"
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
