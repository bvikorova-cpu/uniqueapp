import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type ErrorType =
  | "missing_api_key"
  | "rate_limited"
  | "gateway_error"
  | "empty_image"
  | "bad_request"
  | "unknown";

// Persist the failure so admins can find it in /admin/client-errors by log ID.
async function logFailure(params: {
  logId: string;
  errorType: ErrorType;
  message: string;
  status: number;
  userId?: string | null;
  context?: Record<string, unknown>;
}) {
  const { logId, errorType, message, status, userId, context } = params;
  console.error(`[escape-room-scene] logId=${logId} type=${errorType} status=${status} :: ${message}`);
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const admin = createClient(url, key);
    await admin.from("client_error_events").insert({
      level: "error",
      source: "escape-room.scene-generator",
      message: `[${logId}] ${errorType}: ${message}`.slice(0, 2000),
      route: "/virtual-escape-room",
      user_id: userId ?? null,
      context: { log_id: logId, error_type: errorType, http_status: status, ...(context ?? {}) },
    });
  } catch (e) {
    console.error("[escape-room-scene] failed to persist log", e);
  }
}

function fail(opts: {
  logId: string;
  errorType: ErrorType;
  message: string;
  status: number;
  userId?: string | null;
  context?: Record<string, unknown>;
}) {
  void logFailure(opts);
  return new Response(
    JSON.stringify({
      error: opts.message,
      errorType: opts.errorType,
      logId: opts.logId,
      status: opts.status,
    }),
    { status: opts.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logId = crypto.randomUUID().slice(0, 8);
  let userId: string | null = null;

  try {
    // Auth + rate limit only — the scene image is included in the room unlock,
    // so no extra credits are charged here.
    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 0,
      usageType: "escape_room_scene",
      rateLimit: { max: 30, windowSec: 60, bucket: "ai.escape_room_scene" },
    });
    if (auth.errorResponse) return auth.errorResponse;
    userId = (auth as { userId?: string | null }).userId ?? null;

    const { roomName, theme, description } = await req.json();
    if (!roomName || !theme) {
      return fail({
        logId, userId, status: 400, errorType: "bad_request",
        message: "roomName and theme are required",
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return fail({
        logId, userId, status: 500, errorType: "missing_api_key",
        message: "LOVABLE_API_KEY is not configured",
      });
    }

    const prompt = `Ultra-wide cinematic first-person view of an escape room scene: "${roomName}".
Theme: ${theme}. Scene story: ${description || roomName}.

Requirements:
- The image MUST clearly depict the described location (${roomName}) — no unrelated subjects, no plants, no people, no text.
- Wide angle interior/environment shot as if the player is standing inside the room and looking around.
- Rich searchable detail: furniture, doors, drawers, locks, safes, notes, keys, props and dark corners where objects could be hidden.
- Moody atmospheric lighting matching the ${theme} theme, photorealistic, highly detailed, no watermark, no UI overlay.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = (await response.text()).slice(0, 1000);
      return fail({
        logId, userId,
        status: response.status === 429 ? 429 : 502,
        errorType: response.status === 429 ? "rate_limited" : "gateway_error",
        message: response.status === 429
          ? "AI rate limit exceeded. Please try again in a moment."
          : `AI gateway returned ${response.status}: ${errorText}`,
        context: { room_name: roomName, theme, upstream_status: response.status },
      });
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    const imageUrl = b64 ? `data:image/png;base64,${b64}` : (data?.data?.[0]?.url ?? null);

    if (!imageUrl) {
      return fail({
        logId, userId, status: 502, errorType: "empty_image",
        message: "AI responded without an image",
        context: { room_name: roomName, theme, response_keys: Object.keys(data ?? {}) },
      });
    }

    return new Response(JSON.stringify({ imageUrl, logId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return fail({
      logId, userId, status: 500, errorType: "unknown",
      message: error instanceof Error ? error.message : 'Failed to generate scene',
      context: { stack: error instanceof Error ? error.stack?.slice(0, 2000) : undefined },
    });
  }
});
