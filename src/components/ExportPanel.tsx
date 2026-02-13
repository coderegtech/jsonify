import { JsonValue } from "@/hooks/useJsonEditor";
import { StorageConfig } from "@/lib/storage-config";
import {
  Copy,
  Database,
  Download,
  Globe,
  HardDrive,
  Key,
  Send,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportPanelProps {
  data: JsonValue;
  storageConfig: StorageConfig;
  onStorageConfigChange: (config: StorageConfig) => void;
  onLoadData?: (data: JsonValue) => void;
  clearData?: () => void;
}

export function ExportPanel({
  data,
  storageConfig,
  onStorageConfigChange,
  onLoadData,
  clearData,
}: ExportPanelProps) {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem("apiUrl") || "");
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [method, setMethod] = useState<"GET" | "POST" | "PUT">("GET");
  const [sending, setSending] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [showStoragePanel, setShowStoragePanel] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    toast.success("Copied to clipboard");
  };

  const handleSend = async () => {
    if (!apiUrl.trim()) {
      toast.error("Please enter an API endpoint URL");
      return;
    }

    setApiKey((prev) =>
      apiUrl.trim().replace("https://integrations.fruitask.com", "/api"),
    );

    localStorage.setItem("apiUrl", apiUrl);
    localStorage.setItem("apiKey", apiKey);
    setSending(true);
    try {
      const headers: Record<string, string> = {};
      if (method !== "GET") {
        headers["Content-Type"] = "application/json";
      }
      if (apiKey.trim()) {
        headers["X-API-Key"] = `${apiKey}`;
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      // Only include body for POST/PUT requests
      if (method !== "GET") {
        fetchOptions.body = jsonString;
      }

      const res = await fetch(apiUrl, fetchOptions);

      if (!res.ok) {
        toast.error(`Request failed: ${res.status} ${res.statusText}`);
        setSending(false);
        return;
      }

      // with specific column: https://integrations.fruitask.com/{table_name}/{token}/rows/{row_id}/cells/{column_id}
      // without specific column: https://integrations.fruitask.com/{table_name}/{token}/rows

      if (method === "GET") {
        // Fetch data from API and load into editor
        const responseData = await res.json();

        if (!responseData.data || !responseData.data.rows) {
          toast.error("Invalid response format: missing data.rows");
          setSending(false);
          return;
        }

        // cors problem, change apiUrl from https://integrations.fruitask.com to /api

        const withSpecificColumn = /\/cells\/[^/]+$/.test(apiUrl);
        const withoutSpecificColumn = /\/rows\/?$/.test(apiUrl);
        let jsonData: JsonValue = null;

        if (withoutSpecificColumn) {
          jsonData = responseData.data.rows.map(({ cells }) =>
            Object.entries(cells).reduce(
              (acc, [key, cell]: [string, { value: unknown }]) => {
                acc[key] = cell?.value;
                return acc;
              },
              {},
            ),
          );
        }

        if (withSpecificColumn) {
          jsonData = responseData.data?.value;
        }

        if (!onLoadData) {
          toast.error("Cannot load data: onLoadData callback not provided");
          setSending(false);
          return;
        }

        onLoadData(jsonData);
        toast.success("JSON data loaded from API");
      } else {
        toast.success(`${method} successful (${res.status})`);
      }
    } catch (e) {
      toast.error("Request failed: " + (e as Error).message);
    }
    setSending(false);
  };

  return (
    <div className="p-3 border-t border-border space-y-2">
      <div className="w-full flex items-center gap-2 flex-wrap">
        <button
          className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
          onClick={handleDownload}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          className="flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded hover:bg-secondary/80 transition-colors"
          onClick={handleCopy}
        >
          <Copy className="w-3.5 h-3.5" />
          Copy
        </button>
        <button
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${
            showApiPanel
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => {
            setShowApiPanel(!showApiPanel);
            setShowStoragePanel(false);
          }}
        >
          <Send className="w-3.5 h-3.5" />
          API Sync
        </button>
        <button
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${
            showStoragePanel
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => {
            setShowStoragePanel(!showStoragePanel);
            setShowApiPanel(false);
          }}
        >
          <HardDrive className="w-3.5 h-3.5" />
          File Storage
        </button>

        <div className="flex-1"></div>

        <button
          className="self-end flex items-center gap-1.5 text-xs bg-red-500 text-foreground px-3 py-1.5 rounded hover:bg-red-600 transition-colors"
          onClick={clearData}
        >
          <Trash className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {showApiPanel && (
        <div className="space-y-2 p-3 bg-card rounded-md border border-border">
          <p className="text-xs text-muted-foreground">
            Note: This is a generic API sync feature, only supports in{" "}
            <a
              className="underline"
              href="https://works.fruitask.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fruitask
            </a>{" "}
            API.
          </p>
          <div className="flex items-center gap-2">
            <select
              className="bg-input border border-border rounded text-xs px-2 py-1 focus:outline-none"
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as "GET" | "POST" | "PUT")
              }
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
            <div className="flex items-center gap-1 flex-1 bg-input border border-border rounded px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                className="bg-transparent text-xs w-full focus:outline-none font-mono"
                placeholder="https://integrations.fruitask.com/{table_name}/{token}/rows/{row_id}/cells/{column_id}"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 bg-input border border-border rounded px-2 py-1">
            <Key className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="password"
              className="bg-transparent text-xs w-full focus:outline-none font-mono"
              placeholder="API Token (optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <button
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={handleSend}
            disabled={sending}
          >
            {sending
              ? method === "GET"
                ? "Fetching..."
                : "Sending..."
              : method === "GET"
                ? "Fetch"
                : "Send"}
          </button>
        </div>
      )}

      {showStoragePanel && (
        <div className="space-y-2 p-3 bg-card rounded-md border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">
              File Storage API
            </span>
          </div>
          <div className="flex items-center gap-1 bg-input border border-border rounded px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              className="bg-transparent text-xs w-full focus:outline-none font-mono"
              placeholder="https://looks.flexiapi.fun"
              value={storageConfig.apiUrl}
              onChange={(e) =>
                onStorageConfigChange({
                  ...storageConfig,
                  apiUrl: e.target.value,
                })
              }
            />
          </div>
          <div className="flex items-center gap-1 bg-input border border-border rounded px-2 py-1">
            <Key className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="password"
              className="bg-transparent text-xs w-full focus:outline-none font-mono"
              placeholder="Storage API Key"
              value={storageConfig.apiKey}
              onChange={(e) =>
                onStorageConfigChange({
                  ...storageConfig,
                  apiKey: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1 bg-input border border-border rounded px-2 py-1">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                className="bg-transparent text-xs w-full focus:outline-none font-mono"
                placeholder="Bucket name"
                value={storageConfig.bucket}
                onChange={(e) =>
                  onStorageConfigChange({
                    ...storageConfig,
                    bucket: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-1 bg-input border border-border rounded px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                className="bg-transparent text-xs w-full focus:outline-none font-mono"
                placeholder="Public URL (optional)"
                value={storageConfig.publicUrl}
                onChange={(e) =>
                  onStorageConfigChange({
                    ...storageConfig,
                    publicUrl: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Configure storage API to enable file uploads in the JSON editor.
            Files are uploaded via POST to{" "}
            <code className="bg-muted px-1 rounded">/api/v1/store</code>.
          </p>
        </div>
      )}
    </div>
  );
}
