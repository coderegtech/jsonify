/**
 * Utility function to safely get cell values from Fruitask API response
 * @param cells - The cells object from a Fruitask row
 * @param key - The column/field name to retrieve
 * @returns The cell value or empty string if not found
 */
export const getCell = (
  cells: Record<
    string,
    { value?: any; columnType?: string; columnName?: string }
  >,
  key: string,
): any => {
  const isAttachment =
    cells[key]?.columnType === "attachment"
      ? Array.isArray(cells[key].value)
        ? cells[key].value?.map((image) => image.url)
        : (cells[key]?.value.split(",") as string[])
      : cells[key]?.value;

  return isAttachment ?? "";
};

/**
 * Helper function to split comma-separated cell values
 * @param cells - The cells object from a Fruitask row
 * @param key - The column/field name to retrieve
 * @returns Array of trimmed strings
 */
export const splitCell = (
  cells: Record<string, { value?: unknown }>,
  key: string,
): string[] => {
  const value = cells[key]?.value;
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
};

/**
 * Helper function to parse JSON from cell values
 * @param cells - The cells object from a Fruitask row
 * @param key - The column/field name to retrieve
 * @param fallback - Default value if parsing fails
 * @returns Parsed JSON or fallback value
 */
export const parseJsonCell = <T>(
  cells: Record<string, { value?: any; columnType?: string }>,
  key: string,
  fallback: T,
): T => {
  try {
    const value = cells[key]?.value;
    if (!value) return fallback;
    return cells[key]?.columnType === "json" ? JSON.parse(value) : (value as T);
  } catch {
    return fallback;
  }
};

/**
 * Common fetch options for Fruitask API
 * Includes authentication header and caching configuration
 */
export const getFruitaskFetchOptions = (revalidate: number = 60): RequestInit =>
  ({
    headers: {
      "X-API-Key": process.env.FRUITASK_API_KEY || "",
    },
    cache: "no-store",
    next: { revalidate },
  }) as RequestInit;

/**
 * Type definition for Fruitask API response structure
 */
export interface FruitaskResponse<T = unknown> {
  success: boolean;
  data: {
    rows: Array<{
      id?: string;
      cells: Record<string, { value?: T }>;
    }>;
  };
}

export interface FruitaskRow {
  id?: string;
  cells: Record<string, { value?: unknown }>;
}

/**
 * Generic fetch function for Fruitask API
 * @param apiUrl - The Fruitask API endpoint URL
 * @param apiName - A friendly name for the API (used in error messages)
 * @param revalidate - Cache revalidation time in seconds (default: 60)
 * @returns The data object containing rows, or null if failed
 */
export async function fetchFromFruitask(
  apiUrl: string | undefined,
  apiName: string,
  revalidate: number = 60,
): Promise<{ rows: FruitaskRow[] } | null> {
  if (!apiUrl) {
    console.warn(`${apiName} API URL environment variable is not set`);
    return null;
  }

  try {
    const response = await fetch(apiUrl, getFruitaskFetchOptions(revalidate));

    if (!response.ok) {
      console.error(`Failed to fetch ${apiName}: ${response.status}`);
      return null;
    }

    const responseData: FruitaskResponse = await response.json();

    if (!responseData.success) return null;

    return responseData.data;
  } catch (error) {
    console.error(`Error fetching ${apiName}:`, error);
    return null;
  }
}

/**
 * Convert camelCase or snake_case string to PascalCase
 * @param str - The string to convert
 * @returns PascalCase string
 */
export const toPascalCase = (str: string): string => {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^(\w)/, (_, c) => c.toUpperCase());
};
