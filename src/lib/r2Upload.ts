import { supabase } from "@/integrations/supabase/client";

/**
 * Cloudflare R2 upload helper.
 *
 * R2 is opt-in. If `VITE_USE_R2_UPLOADS` is not true or the server is not
 * configured, this helper falls back to Supabase Storage so existing flows
 * keep working.
 */

export interface R2UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export interface R2UploadOptions {
  /** Storage category prefix, e.g. "wall-media", "unlock-videos". */
  pathPrefix?: string;
  /** Optional explicit file name; defaults to file.name. */
  fileName?: string;
}

const R2_FUNCTION_NAME = "upload-to-r2";

function generateSupabasePath(prefix: string, file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const safeName = (file.name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  return `${cleanPrefix}/${timestamp}-${random}-${safeName}`;
}

/**
 * Returns true when the project is configured to use R2 for new uploads.
 */
export function shouldUseR2(): boolean {
  return import.meta.env.VITE_USE_R2_UPLOADS === "true";
}

/**
 * Upload a file. Tries R2 first when enabled; otherwise falls back to Supabase Storage.
 */
export async function uploadMedia(
  file: File,
  bucket: string,
  opts: R2UploadOptions = {},
): Promise<{ url: string; source: "r2" | "supabase" }> {
  if (shouldUseR2()) {
    try {
      const result = await uploadToR2(file, opts);
      return { url: result.url, source: "r2" };
    } catch (err) {
      console.warn("[r2Upload] R2 upload failed, falling back to Supabase Storage:", err);
    }
  }

  const path = generateSupabasePath(opts.pathPrefix ?? bucket, file);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: publicUrlData.publicUrl, source: "supabase" };
}

/**
 * Upload a file directly to Cloudflare R2 via the upload-to-r2 edge function.
 */
export async function uploadToR2(
  file: File,
  opts: R2UploadOptions = {},
): Promise<R2UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (opts.pathPrefix) formData.append("pathPrefix", opts.pathPrefix);
  if (opts.fileName) formData.append("fileName", opts.fileName);

  const { data, error } = await supabase.functions.invoke<R2UploadResult>(R2_FUNCTION_NAME, {
    body: formData,
  });

  if (error || !data?.url) {
    throw new Error(error?.message ?? "R2 upload returned no URL");
  }

  return data;
}
