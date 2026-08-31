/**
 * upload-to-r2
 *
 * Uploads user media to Cloudflare R2 (S3-compatible) as an opt-in alternative
 * to Supabase Storage. Existing Supabase Storage flows remain untouched.
 *
 * Request: multipart/form-data
 *   - file: File/Blob
 *   - pathPrefix: string (optional, default "user-uploads")
 *   - fileName: string (optional)
 *
 * Response JSON:
 *   { url: string, key: string, bucket: string }
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  S3Client,
  PutObjectCommand,
  type S3ClientConfig,
} from "npm:@aws-sdk/client-s3@3";

const R2_ACCOUNT_ID =
  Deno.env.get("CLOUDFLARE_R2_ACCOUNT_ID_V2") ??
  Deno.env.get("CLOUDFLARE_R2_ACCOUNT_ID") ??
  "";
const R2_ACCESS_KEY_ID = Deno.env.get("CLOUDFLARE_R2_ACCESS_KEY_ID") ?? "";
const R2_SECRET_ACCESS_KEY = Deno.env.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY") ?? "";
const R2_BUCKET_NAME = Deno.env.get("CLOUDFLARE_R2_BUCKET_NAME") ?? "";
const R2_PUBLIC_DOMAIN = Deno.env.get("CLOUDFLARE_R2_PUBLIC_DOMAIN")?.replace(/\/$/, "");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_TYPE_PREFIXES = ["image/", "video/", "audio/"];
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/json",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
  "text/plain",
  "text/csv",
]);

function isAllowedContentType(t: string): boolean {
  return ALLOWED_TYPE_PREFIXES.some((p) => t.startsWith(p)) || ALLOWED_CONTENT_TYPES.has(t);
}

function isConfigured(): boolean {
  return Boolean(
    R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME,
  );
}

function getPublicUrl(key: string): string {
  if (R2_PUBLIC_DOMAIN) {
    return `${R2_PUBLIC_DOMAIN}/${key}`;
  }
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
}

function sanitizePathSegment(segment: string): string {
  return segment
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function generateKey(
  userId: string,
  prefix: string,
  originalName: string,
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const safeName = sanitizePathSegment(originalName) || "file";
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  return `${cleanPrefix}/${userId}/${timestamp}-${random}-${safeName}`;
}

async function getUserIdFromJwt(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!isConfigured()) {
      return new Response(
        JSON.stringify({ error: "R2 is not configured on the server" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = await getUserIdFromJwt(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid multipart form data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty file" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: `File too large. Max ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contentType = file.type || "application/octet-stream";
    if (!isAllowedContentType(contentType)) {
      return new Response(
        JSON.stringify({ error: `Unsupported content type: ${contentType}` }),
        { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pathPrefix =
      typeof formData.get("pathPrefix") === "string" &&
      (formData.get("pathPrefix") as string).trim().length > 0
        ? (formData.get("pathPrefix") as string).trim()
        : "user-uploads";

    const fileName =
      typeof formData.get("fileName") === "string" &&
      (formData.get("fileName") as string).trim().length > 0
        ? (formData.get("fileName") as string).trim()
        : file.name || "upload";

    // Explicit key (mirrors the Supabase Storage layout "<bucket>/<path>").
    const rawKey = formData.get("key");
    let key: string;
    if (typeof rawKey === "string" && rawKey.trim().length > 0) {
      key = rawKey
        .trim()
        .replace(/^\/+/, "")
        .split("/")
        .map((seg) => sanitizePathSegment(seg))
        .filter(Boolean)
        .join("/");
      if (!key) key = generateKey(userId, pathPrefix, fileName);
    } else {
      key = generateKey(userId, pathPrefix, fileName);
    }

    const s3Config: S3ClientConfig = {
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    };

    const s3 = new S3Client(s3Config);

    try {
      const arrayBuffer = await file.arrayBuffer();
      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: new Uint8Array(arrayBuffer),
          ContentType: contentType,
          Metadata: {
            "uploaded-by": userId,
            "original-name": sanitizePathSegment(fileName),
          },
        }),
      );

      const url = getPublicUrl(key);
      return new Response(
        JSON.stringify({ url, key, bucket: R2_BUCKET_NAME }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err: any) {
      console.error("[upload-to-r2] error:", err?.message ?? err);
      return new Response(
        JSON.stringify({ error: "Upload failed", detail: err?.message ?? "unknown" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  },
};
