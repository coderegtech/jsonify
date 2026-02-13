/**
 * data-copy attribute utilities.
 *
 * Scans a document (or iframe) for elements with `data-copy="path.to.key"`
 * and enables contentEditable on them, syncing edits back to the JSON state.
 */

import type { JsonValue } from "./types";

export interface DataCopyElement {
  element: HTMLElement;
  path: string;
  originalValue: string;
}

/**
 * Get a value from a nested object by dot-path.
 * e.g. getByPath({ home: { title: "Hi" } }, "home.title") => "Hi"
 */
export function getByPath(obj: Record<string, JsonValue>, path: string): JsonValue | undefined {
  const keys = path.split(".");
  let current: JsonValue = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, JsonValue>)[key];
  }
  return current;
}

/**
 * Set a value in a nested object by dot-path (immutable — returns new object).
 */
export function setByPath(obj: Record<string, JsonValue>, path: string, value: JsonValue): Record<string, JsonValue> {
  const keys = path.split(".");
  const result = { ...obj };

  if (keys.length === 1) {
    result[keys[0]] = value;
    return result;
  }

  let current: Record<string, JsonValue> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const next = current[key];
    if (next && typeof next === "object" && !Array.isArray(next)) {
      current[key] = { ...(next as Record<string, JsonValue>) };
      current = current[key] as Record<string, JsonValue>;
    } else {
      current[key] = {};
      current = current[key] as Record<string, JsonValue>;
    }
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Scan a document for elements with `data-copy` attribute.
 */
export function scanDataCopyElements(doc: Document): DataCopyElement[] {
  const elements = doc.querySelectorAll<HTMLElement>("[data-copy]");
  return Array.from(elements).map((el) => ({
    element: el,
    path: el.getAttribute("data-copy") || "",
    originalValue: el.textContent || "",
  }));
}

/**
 * Apply contentEditable styling to data-copy elements.
 */
export function enableEditMode(elements: DataCopyElement[]): void {
  for (const { element } of elements) {
    element.contentEditable = "true";
    element.style.outline = "2px dashed hsl(var(--primary, 210 100% 50%))";
    element.style.outlineOffset = "2px";
    element.style.cursor = "text";
    element.style.borderRadius = "2px";
    element.style.transition = "outline-color 0.2s";
    element.setAttribute("data-copy-active", "true");
  }
}

/**
 * Remove contentEditable styling from data-copy elements.
 */
export function disableEditMode(elements: DataCopyElement[]): void {
  for (const { element } of elements) {
    element.contentEditable = "false";
    element.style.outline = "";
    element.style.outlineOffset = "";
    element.style.cursor = "";
    element.style.borderRadius = "";
    element.style.transition = "";
    element.removeAttribute("data-copy-active");
  }
}

/**
 * Update element text content from JSON data.
 */
export function syncElementsFromData(
  elements: DataCopyElement[],
  data: Record<string, JsonValue>,
): void {
  for (const item of elements) {
    const val = getByPath(data, item.path);
    if (val !== undefined && typeof val === "string") {
      if (item.element.textContent !== val) {
        item.element.textContent = val;
      }
    }
  }
}

/**
 * Inject a floating "Edit Mode" toggle button into the page.
 * Returns a cleanup function.
 */
export function injectEditToggle(
  doc: Document,
  onToggle: (active: boolean) => void,
): () => void {
  const btn = doc.createElement("button");
  btn.id = "jsonify-edit-toggle";
  btn.textContent = "✏️ Edit Mode";
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: hsl(210, 100%, 50%);
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  let active = false;
  btn.addEventListener("click", () => {
    active = !active;
    btn.textContent = active ? "✅ Editing" : "✏️ Edit Mode";
    btn.style.background = active ? "hsl(140, 60%, 45%)" : "hsl(210, 100%, 50%)";
    onToggle(active);
  });

  doc.body.appendChild(btn);

  return () => {
    btn.remove();
  };
}
