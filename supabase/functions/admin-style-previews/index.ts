import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { tryVertexImage } from "../_shared/vertexDirect.ts";
import { STYLE_PROMPTS } from "../_shared/photoStylePrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BUCKET = "style-previews";

// Small, cheap thumbnail previews. No user photo is used — a generic,
// anonymous model is described so the preview shows the STYLE only.
const PREVIEW_RULES =
  "Create a small SAMPLE PREVIEW THUMBNAIL that demonstrates a photo-styling preset.\n" +
  "Subject: one generic, anonymous adult model (not a real or recognisable person, no celebrity " +
  "likeness), head-and-shoulders or waist-up, facing the camera.\n" +
  "The whole point of the image is to show the STYLE: its wardrobe, scene, colours, lighting and " +
  "rendering treatment.\n" +
  "Simple composition, low detail complexity, no text, no watermark, no logo, no borders, no collage. " +
  "Fully clothed, tasteful, no nudity, no suggestive content. Output only the finished image.";

function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated." }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin only." }, 403);

    const body = await req.json().catch(() => ({}));
    const styles: string[] = Array.isArray(body?.styles) ? body.styles.slice(0, 10).map(String) : [];
    const overwrite = body?.overwrite === true;
    if (!styles.length) return json({ error: "Pass styles: string[]." }, 400);

    const model = Deno.env.get("GCP_IMAGE_MODEL") || "gemini-2.5-flash-image";
    const started = Date.now();
    const results: { style: string; ok: boolean; path?: string; bytes?: number; ms?: number; error?: string }[] = [];

    for (const style of styles) {
      const stylePrompt = STYLE_PROMPTS[style];
      if (!stylePrompt) {
        results.push({ style, ok: false, error: "Unknown style" });
        continue;
      }

      if (!overwrite) {
        const { data: existing } = await admin
          .from("style_previews")
          .select("style_id")
          .eq("style_id", style)
          .maybeSingle();
        if (existing) {
          results.push({ style, ok: true, path: `${style}.png`, error: "already exists (skipped)" });
          continue;
        }
      }

      const t0 = Date.now();
      try {
        const out = await tryVertexImage(`${PREVIEW_RULES}\n\nStyle: ${stylePrompt}.`, "1:1", 1);
        const b64 = out?.data?.[0]?.b64_json;
        if (!b64) {
          results.push({ style, ok: false, ms: Date.now() - t0, error: "Model returned nothing" });
          continue;
        }
        const bytes = decodeBase64(b64);
        const path = `${style}.png`;
        const up = await admin.storage.from(BUCKET).upload(path, bytes, {
          contentType: "image/png",
          upsert: true,
        });
        if (up.error) {
          results.push({ style, ok: false, ms: Date.now() - t0, error: up.error.message });
          continue;
        }
        await admin.from("style_previews").upsert({
          style_id: style,
          storage_path: path,
          model,
          updated_at: new Date().toISOString(),
        });
        results.push({ style, ok: true, path, bytes: bytes.length, ms: Date.now() - t0 });
      } catch (e) {
        results.push({
          style,
          ok: false,
          ms: Date.now() - t0,
          error: e instanceof Error ? e.message : "Generation failed",
        });
      }
    }

    const generated = results.filter((r) => r.ok && r.bytes).length;
    return json({
      model,
      requested: styles.length,
      generated,
      totalMs: Date.now() - started,
      avgBytes: generated
        ? Math.round(results.reduce((s, r) => s + (r.bytes ?? 0), 0) / generated)
        : 0,
      results,
    });
  } catch (e) {
    console.error("[admin-style-previews] error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
