import { useMemo } from "react";
import { JsonValue } from "@/hooks/useJsonEditor";
import { syntaxHighlight } from "@/lib/json-utils";

interface JsonPreviewProps {
  data: JsonValue;
}

export function JsonPreview({ data }: JsonPreviewProps) {
  const highlighted = useMemo(() => {
    const raw = JSON.stringify(data, null, 2);
    return syntaxHighlight(raw);
  }, [data]);

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <pre
        className="text-xs font-mono p-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
