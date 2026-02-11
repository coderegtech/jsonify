import { useCallback, useReducer, useRef } from "react";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type HistoryEntry = {
  data: JsonValue;
  timestamp: number;
};

type State = {
  data: JsonValue;
  history: HistoryEntry[];
  historyIndex: number;
  searchQuery: string;
};

type Action =
  | { type: "SET_DATA"; payload: JsonValue; pushHistory?: boolean }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_SEARCH"; payload: string };

const MAX_HISTORY = 50;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATA": {
      if (action.pushHistory === false) {
        return { ...state, data: action.payload };
      }
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ data: action.payload, timestamp: Date.now() });
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return {
        ...state,
        data: action.payload,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }
    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        data: state.history[newIndex].data,
        historyIndex: newIndex,
      };
    }
    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        data: state.history[newIndex].data,
        historyIndex: newIndex,
      };
    }
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

const initialData: JsonValue = {
  home: {
    hero: {
      title: "Welcome to Our Platform",
      subtitle: "Build amazing products faster",
      cta: "Get Started",
    },
    features: [
      { title: "Fast", description: "Lightning quick performance" },
      { title: "Secure", description: "Enterprise-grade security" },
      { title: "Scalable", description: "Grows with your business" },
    ],
  },
  about: {
    heading: "About Us",
    description: "We are a team of passionate developers.",
    team_size: 42,
    remote: true,
  },
};

export function useJsonEditor() {
  const initial: HistoryEntry = { data: initialData, timestamp: Date.now() };
  const [state, dispatch] = useReducer(reducer, {
    data: initialData,
    history: [initial],
    historyIndex: 0,
    searchQuery: "",
  });

  const setData = useCallback((data: JsonValue, pushHistory = true) => {
    dispatch({ type: "SET_DATA", payload: data, pushHistory });
  }, []);

  const loadJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      dispatch({ type: "SET_DATA", payload: parsed });
      return { success: true as const };
    } catch (e) {
      return { success: false as const, error: (e as Error).message };
    }
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const setSearch = useCallback(
    (q: string) => dispatch({ type: "SET_SEARCH", payload: q }),
    []
  );

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const updatePath = useCallback(
    (path: (string | number)[], value: JsonValue) => {
      const newData = structuredClone(state.data);
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      setData(newData);
    },
    [state.data, setData]
  );

  const deletePath = useCallback(
    (path: (string | number)[]) => {
      if (path.length === 0) return;
      const newData = structuredClone(state.data);
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      if (Array.isArray(current)) {
        current.splice(lastKey as number, 1);
      } else {
        delete current[lastKey];
      }
      setData(newData);
    },
    [state.data, setData]
  );

  const addField = useCallback(
    (path: (string | number)[], key: string, value: JsonValue) => {
      const newData = structuredClone(state.data);
      let current: any = newData;
      for (const p of path) {
        current = current[p];
      }
      if (Array.isArray(current)) {
        current.push(value);
      } else if (typeof current === "object" && current !== null) {
        current[key] = value;
      }
      setData(newData);
    },
    [state.data, setData]
  );

  const renamePath = useCallback(
    (path: (string | number)[], newKey: string) => {
      if (path.length === 0) return;
      const newData = structuredClone(state.data);
      let parent: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        parent = parent[path[i]];
      }
      const oldKey = path[path.length - 1];
      if (typeof oldKey === "string" && !Array.isArray(parent)) {
        const value = parent[oldKey];
        delete parent[oldKey];
        parent[newKey] = value;
      }
      setData(newData);
    },
    [state.data, setData]
  );

  return {
    data: state.data,
    searchQuery: state.searchQuery,
    setData,
    loadJson,
    updatePath,
    deletePath,
    addField,
    renamePath,
    undo,
    redo,
    canUndo,
    canRedo,
    setSearch,
    historyCount: state.history.length,
    historyIndex: state.historyIndex,
  };
}
