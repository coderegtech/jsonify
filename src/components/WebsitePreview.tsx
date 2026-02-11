import { ExternalLink, Globe, RefreshCw } from "lucide-react";
import { useState } from "react";

export function WebsitePreview() {
  const [url, setUrl] = useState(localStorage.getItem("lastPreviewUrl") || "");
  const [activeUrl, setActiveUrl] = useState(
    localStorage.getItem("lastPreviewUrl") || "",
  );

  const handleLoad = () => {
    let u = url.trim();
    if (u && !u.startsWith("http")) u = "https://" + u;
    setActiveUrl(u);
    localStorage.setItem("lastPreviewUrl", u);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Enter website URL for preview..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoad()}
        />
        <button
          className="p-1.5 rounded hover:bg-accent transition-colors"
          onClick={handleLoad}
          title="Load"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        {activeUrl && (
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <div className="flex-1 bg-muted">
        {activeUrl ? (
          <iframe
            src={activeUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Website Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Enter a URL above to preview a website
          </div>
        )}
      </div>
    </div>
  );
}
