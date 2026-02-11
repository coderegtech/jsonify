import { JsonValue } from "@/hooks/useJsonEditor";
import {
  createDefaultValue,
  getValueType,
  matchesSearch,
} from "@/lib/json-utils";
import { StorageConfig, uploadFileToStorage } from "@/lib/storage-config";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface JsonNodeProps {
  keyName: string | number;
  value: JsonValue;
  path: (string | number)[];
  onUpdate: (path: (string | number)[], value: JsonValue) => void;
  onDelete: (path: (string | number)[]) => void;
  onAdd: (path: (string | number)[], key: string, value: JsonValue) => void;
  onRename: (path: (string | number)[], newKey: string) => void;
  searchQuery: string;
  depth?: number;
  isArrayItem?: boolean;
  storageConfig?: StorageConfig;
}

export function JsonNode({
  keyName,
  value,
  path,
  onUpdate,
  onDelete,
  onAdd,
  onRename,
  searchQuery,
  depth = 0,
  isArrayItem = false,
  storageConfig,
}: JsonNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [editingKey, setEditingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState(String(keyName));
  const [addingField, setAddingField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState("string");
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const type = getValueType(value);
  const isExpandable = type === "object" || type === "array";
  const childEntries = isExpandable
    ? type === "array"
      ? (value as JsonValue[]).map((v, i) => [i, v] as const)
      : Object.entries(value as Record<string, JsonValue>)
    : [];

  // Detect if this string value looks like an image URL
  const isFileValue =
    type === "string" &&
    typeof value === "string" &&
    value.length > 0 &&
    (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i.test(value) ||
      /^https?:\/\/.+/i.test(value));

  const isImageUrl =
    type === "string" &&
    typeof value === "string" &&
    value.length > 0 &&
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i.test(value);

  const handleValueChange = (newVal: string) => {
    let parsed: JsonValue;
    if (type === "number") {
      parsed = Number(newVal) || 0;
    } else if (type === "boolean") {
      parsed = newVal === "true";
    } else if (type === "null") {
      parsed = null;
    } else {
      parsed = newVal;
    }
    onUpdate(path, parsed);
  };

  const handleTypeChange = (newType: string) => {
    if (newType === "file") {
      onUpdate(path, "");
      // Trigger file picker
      setTimeout(() => fileInputRef.current?.click(), 100);
      return;
    }
    onUpdate(path, createDefaultValue(newType));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!storageConfig || !storageConfig.apiUrl.trim()) {
      toast.error("Please configure File Storage API first (in Export panel)");
      return;
    }
    setUploading(true);
    const result = await uploadFileToStorage(file, storageConfig);
    if (result.success) {
      onUpdate(path, result.url);
      toast.success("File uploaded successfully");
    } else {
      toast.error((result as { success: false; error: string }).error);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeySubmit = () => {
    setEditingKey(false);
    if (newKeyName !== String(keyName) && newKeyName.trim()) {
      onRename(path, newKeyName.trim());
    }
  };

  const handleAddField = () => {
    const key =
      type === "array" ? String((value as JsonValue[]).length) : newFieldKey;
    if (type !== "array" && !key.trim()) return;
    onAdd(path, key, createDefaultValue(newFieldType));
    setAddingField(false);
    setNewFieldKey("");
    setNewFieldType("string");
  };

  const matches = matchesSearch(String(keyName), value, searchQuery);
  const hasChildMatch =
    isExpandable && searchQuery
      ? childEntries.some(([k, v]) => matchesSearch(String(k), v, searchQuery))
      : false;

  if (searchQuery && !matches && !hasChildMatch && !isExpandable) {
    return null;
  }

  const typeColors: Record<string, string> = {
    string: "bg-json-string/15 text-json-string",
    number: "bg-json-number/15 text-json-number",
    boolean: "bg-json-boolean/15 text-json-boolean",
    null: "bg-json-null/15 text-json-null",
    object: "bg-muted text-muted-foreground",
    array: "bg-muted text-muted-foreground",
  };

  return (
    <div className="group/node">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
      />

      <div
        className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-accent/50 transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand toggle */}
        <button
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={() => isExpandable && setExpanded(!expanded)}
        >
          {isExpandable ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )
          ) : (
            <span className="w-3.5" />
          )}
        </button>

        {/* Key */}
        {editingKey ? (
          <input
            className="bg-input border border-border rounded px-1.5 py-0.5 text-sm font-mono text-json-key w-28 focus:outline-none focus:ring-1 focus:ring-ring"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onBlur={handleKeySubmit}
            onKeyDown={(e) => e.key === "Enter" && handleKeySubmit()}
            autoFocus
          />
        ) : (
          <span
            className="text-sm font-mono text-json-key cursor-pointer hover:underline shrink-0"
            onDoubleClick={() => {
              if (!isArrayItem) {
                setEditingKey(true);
                setNewKeyName(String(keyName));
              }
            }}
          >
            {isArrayItem ? `[${keyName}]` : String(keyName)}
          </span>
        )}

        <span className="text-muted-foreground text-xs mx-1">:</span>

        {/* Type badge */}
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${typeColors[type] || "bg-muted text-muted-foreground"}`}
        >
          {isImageUrl ? "file" : type}
          {type === "array" && `[${(value as JsonValue[]).length}]`}
          {type === "object" &&
            `{${Object.keys(value as Record<string, JsonValue>).length}}`}
        </span>

        {/* Value editor */}
        {!isExpandable && (
          <div className="flex-1 ml-2 flex items-center gap-1.5">
            {type === "boolean" ? (
              <button
                className={`text-sm font-mono px-2 py-0.5 rounded ${
                  value
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive"
                }`}
                onClick={() => onUpdate(path, !value)}
              >
                {String(value)}
              </button>
            ) : type === "null" ? (
              <span className="text-sm font-mono text-json-null italic">
                null
              </span>
            ) : (
              <>
                <input
                  className="bg-input border border-border rounded px-2 py-0.5 text-sm font-mono text-foreground w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={String(value)}
                  onChange={(e) => handleValueChange(e.target.value)}
                />
                {/* Image preview thumbnail */}
                {isImageUrl && (
                  <button
                    className="shrink-0 rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => setPreviewOpen(true)}
                    title="Preview image"
                  >
                    <img
                      src={value as string}
                      alt="preview"
                      className="w-7 h-7 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </button>
                )}
                {/* Upload button */}
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                ) : isFileValue ? (
                  <button
                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload file"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/node:opacity-100 transition-opacity ml-auto">
          {/* Type changer */}
          <select
            className="bg-input border border-border rounded text-[10px] px-1 py-0.5 text-muted-foreground focus:outline-none"
            value={isImageUrl ? "file" : type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="null">null</option>
            <option value="object">object</option>
            <option value="array">array</option>
            <option value="file">file</option>
          </select>

          {isExpandable && (
            <button
              className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
              onClick={() => setAddingField(true)}
              title="Add field"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {depth > 0 && (
            <button
              className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
              onClick={() => onDelete(path)}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Full image preview overlay */}
      {previewOpen && isImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-3 -right-3 p-1 bg-card rounded-full border border-border hover:bg-accent transition-colors z-10"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={value as string}
              alt="Full preview"
              className="max-w-full max-h-[80vh] rounded-lg border border-border object-contain"
            />
            <p className="text-xs text-muted-foreground mt-2 truncate font-mono">
              {value as string}
            </p>
          </div>
        </div>
      )}

      {/* Children */}
      {isExpandable && expanded && (
        <div>
          {childEntries.map(([key, val]) => (
            <JsonNode
              key={`${path.join(".")}.${key}`}
              keyName={key}
              value={val}
              path={[...path, key]}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAdd={onAdd}
              onRename={onRename}
              searchQuery={searchQuery}
              depth={depth + 1}
              isArrayItem={type === "array"}
              storageConfig={storageConfig}
            />
          ))}

          {/* Add field inline form */}
          {addingField && (
            <div
              className="flex items-center gap-2 py-1 px-2"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              {type !== "array" && (
                <input
                  className="bg-input border border-border rounded px-2 py-0.5 text-sm font-mono w-28 focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="key"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                />
              )}
              <select
                className="bg-input border border-border rounded text-xs px-1.5 py-0.5 text-muted-foreground focus:outline-none"
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="null">null</option>
                <option value="object">object</option>
                <option value="array">array</option>
                <option value="file">file</option>
              </select>
              <button
                className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded hover:bg-primary/90 transition-colors"
                onClick={handleAddField}
              >
                Add
              </button>
              <button
                className="text-xs text-muted-foreground px-2 py-0.5 hover:text-foreground transition-colors"
                onClick={() => setAddingField(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
