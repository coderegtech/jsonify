import { JsonValue } from "@/hooks/useJsonEditor";
import { StorageConfig } from "@/lib/storage-config";
import {
  FileText,
  Link,
  Plus,
  Redo2,
  Search,
  Undo2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { JsonNode } from "./JsonNode";

interface JsonTreeEditorProps {
  data: JsonValue;
  searchQuery: string;
  onUpdate: (path: (string | number)[], value: JsonValue) => void;
  onDelete: (path: (string | number)[]) => void;
  onAdd: (path: (string | number)[], key: string, value: JsonValue) => void;
  onDuplicate: (path: (string | number)[]) => void;
  onRename: (path: (string | number)[], newKey: string) => void;
  onSearch: (query: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onLoadJson: (json: string) => { success: boolean; error?: string };
  onSetData: (data: JsonValue) => void;
  storageConfig?: StorageConfig;
}

export function JsonTreeEditor({
  data,
  searchQuery,
  onUpdate,
  onDelete,
  onAdd,
  onDuplicate,
  onRename,
  onSearch,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onLoadJson,
  onSetData,
  storageConfig,
}: JsonTreeEditorProps) {
  const [importMode, setImportMode] = useState<null | "paste" | "url" | "file">(
    null,
  );
  const [pasteValue, setPasteValue] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [importError, setImportError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = onLoadJson(ev.target?.result as string);
      if (!result.success) setImportError(result.error || "Invalid JSON");
      else {
        setImportMode(null);
        setImportError("");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    const result = onLoadJson(pasteValue);
    if (!result.success) setImportError(result.error || "Invalid JSON");
    else {
      setImportMode(null);
      setPasteValue("");
      setImportError("");
    }
  };

  const handleUrlImport = async () => {
    setLoading(true);
    setImportError("");
    try {
      const res = await fetch(urlValue);
      const text = await res.text();
      const result = onLoadJson(text);
      if (!result.success) setImportError(result.error || "Invalid JSON");
      else {
        setImportMode(null);
        setUrlValue("");
      }
    } catch (e) {
      setImportError("Failed to fetch URL: " + (e as Error).message);
    }
    setLoading(false);
  };

  const rootEntries =
    typeof data === "object" && data !== null
      ? Array.isArray(data)
        ? data.map((v, i) => [i, v] as const)
        : Object.entries(data as Record<string, JsonValue>)
      : [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="flex items-center gap-1 bg-input rounded-md px-2 py-1 flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="bg-transparent text-sm focus:outline-none w-full placeholder:text-muted-foreground"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button
          className="p-1.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border" />
        <button
          className="p-1.5 rounded hover:bg-accent transition-colors"
          onClick={() => setImportMode(importMode === "file" ? null : "file")}
          title="Upload JSON file"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded hover:bg-accent transition-colors"
          onClick={() => setImportMode(importMode === "paste" ? null : "paste")}
          title="Paste JSON"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded hover:bg-accent transition-colors"
          onClick={() => setImportMode(importMode === "url" ? null : "url")}
          title="Fetch from URL"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>

      {/* Import Panel */}
      {importMode && (
        <div className="p-3 border-b border-border bg-card">
          {importMode === "file" && (
            <div>
              <input
                type="file"
                accept=".json"
                ref={fileRef}
                onChange={handleFileUpload}
                className="text-sm text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground file:cursor-pointer"
              />
            </div>
          )}
          {importMode === "paste" && (
            <div className="space-y-2">
              <textarea
                className="w-full h-32 bg-input border border-border rounded-md p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none scrollbar-thin"
                placeholder="Paste JSON here..."
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
              />
              <button
                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
                onClick={handlePasteImport}
              >
                Import
              </button>
            </div>
          )}
          {importMode === "url" && (
            <div className="flex gap-2">
              <input
                className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="https://api.example.com/content.json"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
              />
              <button
                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={handleUrlImport}
                disabled={loading}
              >
                {loading ? "Loading..." : "Fetch"}
              </button>
            </div>
          )}
          {importError && (
            <p className="text-destructive text-xs mt-2">{importError}</p>
          )}
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-auto scrollbar-thin py-2">
        {rootEntries.map(([key, val]) => (
          <JsonNode
            key={`root.${key}`}
            keyName={key}
            value={val}
            path={[key]}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAdd={onAdd}
            onDuplicate={onDuplicate}
            onRename={onRename}
            searchQuery={searchQuery}
            depth={0}
            isArrayItem={Array.isArray(data)}
            storageConfig={storageConfig}
          />
        ))}

        {/* Add root field */}
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          onClick={() => {
            const key = prompt("Enter key name:");
            if (
              key &&
              typeof data === "object" &&
              data !== null &&
              !Array.isArray(data)
            ) {
              onAdd([], key, "");
            }
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add root field
        </button>
      </div>
    </div>
  );
}
