import { useState } from "react";
import { JsonValue } from "@/hooks/useJsonEditor";
import {
  Download,
  Copy,
  Send,
  Check,
  Key,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface ExportPanelProps {
  data: JsonValue;
}

export function ExportPanel({ data }: ExportPanelProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [method, setMethod] = useState<"POST" | "PUT">("POST");
  const [sending, setSending] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);

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
    setSending(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey.trim()) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      const res = await fetch(apiUrl, {
        method,
        headers,
        body: jsonString,
      });
      if (res.ok) {
        toast.success(`${method} successful (${res.status})`);
      } else {
        toast.error(`Request failed: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      toast.error("Request failed: " + (e as Error).message);
    }
    setSending(false);
  };

  return (
    <div className="p-3 border-t border-border space-y-2">
      <div className="flex items-center gap-2">
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
          onClick={() => setShowApiPanel(!showApiPanel)}
        >
          <Send className="w-3.5 h-3.5" />
          API Sync
        </button>
      </div>

      {showApiPanel && (
        <div className="space-y-2 p-3 bg-card rounded-md border border-border">
          <div className="flex items-center gap-2">
            <select
              className="bg-input border border-border rounded text-xs px-2 py-1 focus:outline-none"
              value={method}
              onChange={(e) => setMethod(e.target.value as "POST" | "PUT")}
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
            <div className="flex items-center gap-1 flex-1 bg-input border border-border rounded px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                className="bg-transparent text-xs w-full focus:outline-none font-mono"
                placeholder="https://api.example.com/content"
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
              placeholder="Bearer token (optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <button
            className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
