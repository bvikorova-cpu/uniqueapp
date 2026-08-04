import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STYLE_PROMPTS: Record<string, string> = {
  cyber: "neon cyberpunk holographic avatar, glowing cyan and magenta rim light, futuristic visor, volumetric light rays",
  mystic: "ancient ethereal mystic being, glowing runes, soft golden aura, translucent holographic shimmer",
  cosmic: "cosmic space-born entity, nebula skin, starfield glow, iridescent holographic particles",
  nature: "bio-organic living holographic being made of glowing flora, vines and luminous leaves, emerald light",
  crystal: "crystalline light form, prismatic refractions, faceted translucent body, icy blue-violet glow",
  shadow: "dark matter construct, shadow silhouette with violet edge glow, smoky holographic wisps",
};

const LOVABLE_IMAGE_URL = "https://ai.gateway.lovable.dev/v1/images/generations";

const extractImage = (data: any): string | null => {
  const b64 = data?.data?.[0]?.b64_json;
  if (typeof b64 === "string" && b64) return `data:image/png;base64,${b64}`;
  const url = data?.data?.[0]?.url;
  if (typeof url === "string" && url) return url;
  const msg = data?.choices?.[0]?.message;
  const fromImages = msg?.images?.[0]?.image_url?.url || msg?.images?.[0]?.url;
  if (typeof fromImages === "string" && fromImages) return fromImages;
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization") ?? "";
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, style, traits } = await req.json();
    const styleHint = STYLE_PROMPTS[String(style || "").toLowerCase()] || STYLE_PROMPTS.cyber;
    const traitList = Array.isArray(traits) && traits.length ? traits.join(", ") : "bold, creative";

    const prompt =
      `Holographic 3D avatar portrait of a character named "${name}". ${styleHint}. ` +
      `Personality expressed through pose and expression: ${traitList}. ` +
      `Centered bust portrait, dark background, glowing holographic scanlines, highly detailed, square 1:1.`;

    let imageData: string | null = null;
    let lastErr = "";
    for (const model of ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"]) {
      const res = await fetch(LOVABLE_IMAGE_URL, {
        method: "POST",
        headers: { "Lovable-API-Key": LOVABLE_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, n: 1, size: "1024x1024" }),
      });
      if (!res.ok) {
        lastErr = `${res.status} ${await res.text()}`;
        continue;
      }
      imageData = extractImage(await res.json());
      if (imageData) break;
    }
    if (!imageData) throw new Error(`Image generation failed: ${lastErr || "no image returned"}`);

    // Persist to public storage so the avatar image is permanently viewable.
    let publicUrl = imageData;
    if (imageData.startsWith("data:")) {
      const base64 = imageData.split(",")[1] ?? "";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const path = `${user.id}/holographic/${crypto.randomUUID()}.png`;
      const { error: upErr } = await admin.storage
        .from("animated-avatars")
        .upload(path, bytes, { contentType: "image/png", upsert: true });
      if (!upErr) {
        publicUrl = admin.storage.from("animated-avatars").getPublicUrl(path).data.publicUrl;
      } else {
        console.error("upload failed", upErr);
      }
    }

    const { data: row, error: insErr } = await admin
      .from("holographic_avatars")
      .insert({
        user_id: user.id,
        name: String(name || "Avatar"),
        style: String(style || "cyber"),
        traits: Array.isArray(traits) ? traits : [],
        image_url: publicUrl,
      })
      .select()
      .single();
    if (insErr) console.error("insert failed", insErr);

    return new Response(JSON.stringify({ imageUrl: publicUrl, avatar: row ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("holographic-avatar-image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
