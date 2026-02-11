import { JsonValue } from "@/hooks/useJsonEditor";

export function getValueType(
  value: JsonValue
): "string" | "number" | "boolean" | "null" | "object" | "array" {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as "string" | "number" | "boolean" | "object";
}

export function createDefaultValue(type: string): JsonValue {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "null":
      return null;
    case "object":
      return {};
    case "array":
      return [];
    default:
      return "";
  }
}

export function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-json-key";
        } else {
          cls = "text-json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "text-json-boolean";
      } else if (/null/.test(match)) {
        cls = "text-json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export function matchesSearch(
  key: string,
  value: JsonValue,
  query: string
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (key.toLowerCase().includes(q)) return true;
  if (typeof value === "string" && value.toLowerCase().includes(q)) return true;
  if (typeof value === "number" && String(value).includes(q)) return true;
  return false;
}
