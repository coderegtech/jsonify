export interface StorageConfig {
  apiUrl: string;
  apiKey: string;
  bucket: string;
  publicUrl: string;
  subPath?: string;
  isPublic: boolean;
}

export const defaultStorageConfig: StorageConfig = {
  apiUrl: "",
  apiKey: "",
  bucket: "",
  publicUrl: "",
  subPath: "",
  isPublic: true,
};

export async function uploadFileToStorage(
  file: File,
  config: StorageConfig,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  if (!config.apiUrl.trim()) {
    return { success: false, error: "Storage API URL is not configured" };
  }
  if (!config.apiKey.trim()) {
    return { success: false, error: "Storage API Key is not configured" };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    if (config.bucket.trim()) {
      formData.append("bucket", config.bucket);
    }
    if (config.subPath?.trim()) {
      formData.append("subPath", config.subPath);
    }
    formData.append("isPublic", String(config.isPublic));

    const storeUrl = config.apiUrl.replace(/\/$/, "") + "/api/v1/store";

    const res = await fetch(storeUrl, {
      method: "POST",
      headers: {
        Authorization: `${config.apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        error: `Upload failed (${res.status}): ${text}`,
      };
    }

    const data = await res.json();
    // Try common response shapes
    const fileUrl =
      data.url ||
      data.file_url ||
      data.public_url ||
      (data.id && config.publicUrl
        ? `${config.publicUrl.replace(/\/$/, "")}/${data.id}`
        : null) ||
      data.data?.url ||
      data.data?.file_url;

    if (!fileUrl) {
      return {
        success: false,
        error:
          "Upload succeeded but no URL returned. Response: " +
          JSON.stringify(data),
      };
    }

    return { success: true, url: fileUrl };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
