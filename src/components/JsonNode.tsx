import { useState } from "react";
import { JsonValue } from "@/hooks/useJsonEditor";
import { getValueType, createDefaultValue, matchesSearch } from "@/lib/json-utils";
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  GripVertical,
} from "lucide-react";

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
}: JsonNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [editingKey, setEditingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState(String(keyName));
  const [addingField, setAddingField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState("string");

  const type = getValueType(value);
  const isExpandable = type === "object" || type === "array";
  const childEntries = isExpandable
    ? type === "array"
      ? (value as JsonValue[]).map((v, i) => [i, v] as const)
      : Object.entries(value as Record<string, JsonValue>)
    : [];

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
    onUpdate(path, createDefaultValue(newType));
  };

  const handleKeySubmit = () => {
    setEditingKey(false);
    if (newKeyName !== String(keyName) && newKeyName.trim()) {
      onRename(path, newKeyName.trim());
    }
  };

  const handleAddField = () => {
    const key = type === "array" ? String((value as JsonValue[]).length) : newFieldKey;
    if (type !== "array" && !key.trim()) return;
    onAdd(path, key, createDefaultValue(newFieldType));
    setAddingField(false);
    setNewFieldKey("");
    setNewFieldType("string");
  };

  const matches = matchesSearch(String(keyName), value, searchQuery);
  const hasChildMatch = isExpandable && searchQuery
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
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${typeColors[type]}`}
        >
          {type}
          {type === "array" && `[${(value as JsonValue[]).length}]`}
          {type === "object" &&
            `{${Object.keys(value as Record<string, JsonValue>).length}}`}
        </span>

        {/* Value editor */}
        {!isExpandable && (
          <div className="flex-1 ml-2">
            {type === "boolean" ? (
              <button
                className={`text-sm font-mono px-2 py-0.5 rounded ${
                  value ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
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
              <input
                className="bg-input border border-border rounded px-2 py-0.5 text-sm font-mono text-foreground w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={String(value)}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/node:opacity-100 transition-opacity ml-auto">
          {/* Type changer */}
          <select
            className="bg-input border border-border rounded text-[10px] px-1 py-0.5 text-muted-foreground focus:outline-none"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="null">null</option>
            <option value="object">object</option>
            <option value="array">array</option>
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
