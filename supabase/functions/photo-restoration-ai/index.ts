// Universal photo-restoration AI backend.
// Handles: restore, colorize, repair, enhance, bg-remove, colorize-pro,
// face-enhance, upscale. Deducts from `photo_credits` table.
// Uses OpenAI gpt-image-1 for real image edits.
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

const PROMPTS: Record<Operation, string> = {
  restore:
    "Restore this old photograph. Repair scratches, tears, dust spots, faded areas and torn edges while preserving original facial features, expressions, clothing detail and composition. Produce a clean, sharp restored version.",
  colorize:
    "Colorize this black and white photo with realistic, era-appropriate colors. Preserve skin tones, fabric textures, and lighting. Output a natural-looking color photograph.",
  repair:
    "Repair this damaged photograph: remove scratches, creases, dust, mold and tears. Reconstruct missing edges and details realistically. Keep the original composition unchanged.",
  enhance:
    "Enhance this photo: sharpen details, improve contrast and clarity, reduce noise and blur. Preserve the original colors and composition.",
  "bg-remove":
    "Remove the background completely. Output the foreground subject perfectly cut out on a fully transparent background. Preserve original detail, edges and hair.",
  "colorize-pro":
    "Apply era-accurate professional colorization to this photograph. Use historically appropriate fabric dyes, lighting and skin tones for the period. Maintain photographic realism.",
  "face-enhance":
    "Enhance and upscale faces in this photograph: sharpen features, recover skin texture, repair eyes and mouth, improve lighting on the face. Keep identity unchanged.",
  upscale:
    "Upscale this image to high resolution. Add sharpness, recover detail, reduce compression artifacts. Output a 4K-quality version.",
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const imageUrl: string | undefined = body.imageUrl;
    const opIn: string = body.operation ?? body.restorationType ?? body.task ?? "restore";
    if (!imageUrl) throw new Error("imageUrl is required");

    // Map legacy aliases
    const aliasMap: Record<string, Operation> = {
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
    const operation: Operation = aliasMap[opIn] ?? "restore";
    const cost = COSTS[operation];

    // Admin client for credit / storage / history mutations
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Check credits
    const { data: creditRow } = await admin
      .from("photo_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const remaining = creditRow?.credits_remaining ?? 0;

    // Admin bypass
    const ADMIN_USER_ID = Deno.env.get("ADMIN_USER_ID");
    const isAdmin = ADMIN_USER_ID && user.id === ADMIN_USER_ID;

    if (!isAdmin && remaining < cost) {
      return new Response(
        JSON.stringify({
          error: `INSUFFICIENT_CREDITS`,
          message: `Need ${cost} credits, have ${remaining}.`,
          required: cost,
          remaining,
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

    // Build OpenAI image-edit request
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("image", srcBlob, "input.png");
    form.append("prompt", PROMPTS[operation]);
    form.append("size", operation === "upscale" ? "1536x1536" : "1024x1024");
    if (operation === "bg-remove") form.append("background", "transparent");

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

    // Upload to old-photos bucket
    const filePath = `${user.id}/restored/${Date.now()}-${operation}.png`;
    const { error: upErr } = await admin.storage
      .from("old-photos")
      .upload(filePath, out, { contentType: "image/png", upsert: false });
    if (upErr) throw upErr;
    const { data: urlData } = admin.storage.from("old-photos").getPublicUrl(filePath);
    const resultUrl = urlData.publicUrl;

    // Deduct credits (skip for admin)
    if (!isAdmin) {
      await admin
        .from("photo_credits")
        .update({
          credits_remaining: remaining - cost,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    // Log to old_photos history
    try {
      await admin.from("old_photos").insert({
        user_id: user.id,
        original_url: imageUrl,
        restored_url: resultUrl,
        restoration_type: operation,
        credits_used: cost,
      });
    } catch (_e) {/* non-blocking */}

    // Return URL under every alias the frontend components consume.
    return new Response(
      JSON.stringify({
        success: true,
        resultUrl,
        restoredImageUrl: resultUrl,
        processedImageUrl: resultUrl,
        enhancedImageUrl: resultUrl,
        colorizedImageUrl: resultUrl,
        upscaledImageUrl: resultUrl,
        operation,
        creditsDeducted: isAdmin ? 0 : cost,
        creditsRemaining: isAdmin ? 999999 : remaining - cost,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("photo-restoration-ai error", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
