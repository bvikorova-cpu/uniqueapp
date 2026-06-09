// Universal photo processing edge function.
// Handles: bg-remove, restore, colorize, repair, enhance, colorize-pro,
// face-enhance, upscale. Uses OpenAI gpt-image-1 for real image edits.
// Supports two credit pools: `photo_credits` (default for photo-restoration page)
// and `ai_credits` (legacy `remove-background` callers).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Operation =
  | "restore"
  | "colorize"
  | "repair"
  | "enhance"
  | "bg-remove"
  | "colorize-pro"
  | "face-enhance"
  | "upscale";

const COSTS: Record<Operation, number> = {
  restore: 1,
  colorize: 1,
  repair: 1,
  enhance: 1,
  "bg-remove": 3,
  "colorize-pro": 8,
  "face-enhance": 5,
  upscale: 5,
};

const BG_PROMPTS: Record<string, string> = {
  transparent:
    "Remove the background completely. Output the foreground subject perfectly cut out on a fully transparent background. Preserve all original detail, edges, and hair.",
  white: "Remove the background and replace it with a clean solid white background. Keep subject sharp.",
  black: "Remove the background and replace it with a clean solid black background. Keep subject sharp.",
  "gradient-blue":
    "Remove the background and replace it with a smooth blue gradient (deep navy to bright cyan). Keep subject sharp.",
  "gradient-purple":
    "Remove the background and replace it with a smooth purple gradient (deep violet to magenta). Keep subject sharp.",
  blur: "Keep the original background but apply a strong cinematic blur (depth-of-field). Keep subject sharp.",
};

const PROMPTS: Record<Operation, string> = {
  restore:
    "Restore this old photograph. Repair scratches, tears, dust spots, faded areas and torn edges while preserving original facial features, expressions, clothing detail and composition. Produce a clean, sharp restored version.",
  colorize:
    "Colorize this black and white photo with realistic, era-appropriate colors. Preserve skin tones, fabric textures, and lighting. Output a natural-looking color photograph.",
  repair:
    "Repair this damaged photograph: remove scratches, creases, dust, mold and tears. Reconstruct missing edges and details realistically. Keep the original composition unchanged.",
  enhance:
    "Enhance this photo: sharpen details, improve contrast and clarity, reduce noise and blur. Preserve the original colors and composition.",
  "bg-remove": BG_PROMPTS.transparent,
  "colorize-pro":
    "Apply era-accurate professional colorization to this photograph. Use historically appropriate fabric dyes, lighting and skin tones for the period. Maintain photographic realism.",
  "face-enhance":
    "Enhance and upscale faces in this photograph: sharpen features, recover skin texture, repair eyes and mouth, improve lighting on the face. Keep identity unchanged.",
  upscale:
    "Upscale this image to high resolution. Add sharpness, recover detail, reduce compression artifacts. Output a 4K-quality version.",
};

const ALIAS: Record<string, Operation> = {
  restore: "restore",
  colorize: "colorize",
  repair: "repair",
  enhance: "enhance",
  "bg-remove": "bg-remove",
  "background-removal": "bg-remove",
  photo_bg_remove: "bg-remove",
  "colorize-pro": "colorize-pro",
  photo_colorize: "colorize-pro",
  "face-enhance": "face-enhance",
  photo_face_enhance: "face-enhance",
  upscale: "upscale",
  photo_upscale: "upscale",
  photo_restore: "restore",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sbAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await sbAuth.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const imageUrl: string | undefined = body.imageUrl;
    if (!imageUrl) throw new Error("imageUrl is required");

    const rawOp: string =
      body.operation ?? body.restorationType ?? body.task ?? "bg-remove";
    const operation: Operation = ALIAS[rawOp] ?? "bg-remove";
    const cost = COSTS[operation];

    // Credit pool selection — photo_credits is the photo-restoration page,
    // ai_credits is the legacy general AI tools pool.
    const creditPool: "photo_credits" | "ai_credits" =
      body.creditPool === "ai_credits" ? "ai_credits" : "photo_credits";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const ADMIN_USER_ID = Deno.env.get("ADMIN_USER_ID");
    const isAdmin = ADMIN_USER_ID && user.id === ADMIN_USER_ID;

    // Check credits
    const { data: creditRow } = await admin
      .from(creditPool)
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const remaining = creditRow?.credits_remaining ?? 0;

    if (!isAdmin && remaining < cost) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: `Need ${cost} credits, have ${remaining}.`,
          required: cost, remaining,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch source image
    const srcRes = await fetch(imageUrl);
    if (!srcRes.ok) throw new Error("Could not fetch source image");
    const srcBlob = new Blob([await srcRes.arrayBuffer()], {
      type: srcRes.headers.get("content-type") ?? "image/png",
    });

    // Pick prompt — bg-remove supports color variants
    let prompt = PROMPTS[operation];
    if (operation === "bg-remove" && body.bgColor && BG_PROMPTS[body.bgColor]) {
      prompt = BG_PROMPTS[body.bgColor];
    }

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("image", srcBlob, "input.png");
    form.append("prompt", prompt);
    form.append("size", operation === "upscale" ? "1536x1536" : "1024x1024");
    if (operation === "bg-remove" && (!body.bgColor || body.bgColor === "transparent")) {
      form.append("background", "transparent");
    }

    const aiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("OpenAI error", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`OpenAI ${aiRes.status}: ${txt.slice(0, 200)}`);
    }

    const aiData = await aiRes.json();
    const b64 = aiData?.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI did not return an image");
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);

    // Upload — photo pool to old-photos bucket, ai pool to stock-content
    const bucket = creditPool === "photo_credits" ? "old-photos" : "stock-content";
    const folder = operation === "bg-remove" ? "bg-removed" : "restored";
    const filePath = `${user.id}/${folder}/${Date.now()}-${operation}.png`;
    const { error: upErr } = await admin.storage
      .from(bucket)
      .upload(filePath, out, { contentType: "image/png", upsert: false });
    if (upErr) throw upErr;
    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(filePath);
    const resultUrl = urlData.publicUrl;

    // Deduct credits (skip for admin)
    if (!isAdmin) {
      await admin
        .from(creditPool)
        .update({
          credits_remaining: remaining - cost,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    // Log to old_photos if photo pool
    if (creditPool === "photo_credits") {
      try {
        await admin.from("old_photos").insert({
          user_id: user.id,
          original_url: imageUrl,
          restored_url: resultUrl,
          restoration_type: operation,
          credits_used: cost,
        });
      } catch (_e) {/* non-blocking */}
    } else {
      try {
        await admin.from("ai_usage_history").insert({
          user_id: user.id,
          usage_type: `image_${operation}`,
          credits_used: cost,
          description: `Photo ${operation}`,
        });
      } catch (_e) {/* non-blocking */}
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultUrl,
        restoredImageUrl: resultUrl,
        processedImageUrl: resultUrl,
        enhancedImageUrl: resultUrl,
        colorizedImageUrl: resultUrl,
        upscaledImageUrl: resultUrl,
        filePath,
        operation,
        bgColor: body.bgColor ?? null,
        creditsDeducted: isAdmin ? 0 : cost,
        creditsRemaining: isAdmin ? 999999 : remaining - cost,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("remove-background (universal photo) error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
