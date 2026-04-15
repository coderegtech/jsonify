import { JsonValue, useJsonEditor } from "@/hooks/useJsonEditor";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type RightTab = "preview" | "website";

type EditorContextValue = ReturnType<typeof useJsonEditor> & {
  ws: ReturnType<typeof useWebSocket>;
  rightTab: RightTab;
  setRightTab: (tab: RightTab) => void;
  leftCollapsed: boolean;
  setLeftCollapsed: (collapsed: boolean) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function JsonEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const editor = useJsonEditor();
  const { setData } = editor;

  const handleRemoteUpdate = useCallback(
    (data: JsonValue) => {
      setData(data, false);
    },
    [setData],
  );

  const ws = useWebSocket(editor.data, handleRemoteUpdate);

  const [rightTab, setRightTabState] = useState<RightTab>(() => {
    const stored = localStorage.getItem("rightTab");
    return stored === "website" ? "website" : "preview";
  });

  const [leftCollapsed, setLeftCollapsedState] = useState(() => {
    return localStorage.getItem("leftCollapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("rightTab", rightTab);
  }, [rightTab]);

  useEffect(() => {
    localStorage.setItem("leftCollapsed", String(leftCollapsed));
  }, [leftCollapsed]);

  const setRightTab = useCallback((tab: RightTab) => setRightTabState(tab), []);
  const setLeftCollapsed = useCallback(
    (collapsed: boolean) => setLeftCollapsedState(collapsed),
    [],
  );

  return (
    <EditorContext.Provider
      value={{
        ...editor,
        ws,
        rightTab,
        setRightTab,
        leftCollapsed,
        setLeftCollapsed,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx)
    throw new Error("useEditorContext must be used within JsonEditorProvider");
  return ctx;
}
