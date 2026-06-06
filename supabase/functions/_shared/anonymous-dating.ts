// Shared helpers for Anonymous Dating edge functions
import { z } from "https://esm.sh/zod@3.23.8";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
): Response {
  return json({ error: code, message, ...extra }, status);
}

// Hard caps to mitigate prompt injection / DoS
const MAX_STR = 4000;
const MAX_MSGS = 50;
const safeStr = z.string().trim().max(MAX_STR);

export const aiRequestSchema = z.object({
  feature: z.string().min(1).max(64),
  matchId: z.string().uuid().optional(),
  payload: z
    .object({
      message: safeStr.optional(),
      messages: z
        .array(z.object({ role: z.string().max(16), content: safeStr }))
        .max(MAX_MSGS)
        .optional(),
      chat_history: z
        .array(z.object({ role: z.string().max(16), content: safeStr }))
        .max(MAX_MSGS)
        .optional(),
      context: safeStr.optional(),
      city: z.string().trim().max(120).optional(),
      profile_a: z.record(z.unknown()).optional(),
      profile_b: z.record(z.unknown()).optional(),
      user_profile: z.record(z.unknown()).optional(),
      partner_profile: z.record(z.unknown()).optional(),
      category: z.string().trim().max(64).optional(),
    })
    .passthrough()
    .default({}),
});

export type AIRequest = z.infer<typeof aiRequestSchema>;

export const findMatchSchema = z.object({
  mode: z.enum(["preview", "match"]).default("match"),
  targetUserId: z.string().uuid().optional(),
  filters: z
    .object({
      location: z.string().trim().max(120).optional(),
      preferred_gender: z.string().trim().max(32).optional(),
      relationship_goal: z.string().trim().max(64).optional(),
      languages: z.array(z.string().trim().max(32)).max(20).optional(),
      min_shared_interests: z.number().int().min(0).max(20).optional(),
    })
    .default({}),
});

/**
 * Strip raw PII from payload for usage logging.
 * Stores only structural fingerprints (lengths, counts).
 */
export function sanitizePayloadForLog(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload ?? {})) {
    if (typeof v === "string") {
      out[k] = { _type: "string", length: v.length };
    } else if (Array.isArray(v)) {
      out[k] = { _type: "array", count: v.length };
    } else if (v && typeof v === "object") {
      out[k] = { _type: "object", keys: Object.keys(v as object).length };
    } else {
      out[k] = v;
    }
  }
  return out;
}
