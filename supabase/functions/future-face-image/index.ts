import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Action whitelist with credit cost & prompt template
const ACTIONS: Record<string, { cost: number; prompt: (p: any) => string }> = {
  age_progression: { cost: 6, prompt: ({ years }) => `Apply realistic age progression of +${years || 20} years to the face in this photo. Add natural wrinkles, fine lines, slight skin sagging, age spots, gray hair where appropriate. Keep identity, pose, lighting and background unchanged. Photorealistic.` },
  age_reversal: { cost: 6, prompt: () => `Make the person in this photo look 15 years younger. Smooth fine lines, even skin tone, restore youthful glow, slightly fuller cheeks, brighter eyes. Keep identity, pose, lighting unchanged. Photorealistic.` },
  baby_predict: { cost: 8, prompt: () => `Generate a photorealistic image of a baby (around 2 years old) that combines facial features from BOTH faces shown. Mix eye color, nose shape, hair color, skin tone naturally. Cute studio portrait, soft lighting, neutral background.` },
  gender_swap: { cost: 6, prompt: () => `Swap the apparent gender of the person in this photo while preserving identity. Adjust hair, jawline, brows, makeup naturally. Same pose, same background, photorealistic.` },
  hair_makeover: { cost: 5, prompt: ({ style }) => `Change the hairstyle of the person to: ${style || "modern shoulder-length bob with subtle highlights"}. Keep face, expression, lighting and background unchanged. Photorealistic.` },
  beard_filter: { cost: 5, prompt: ({ style }) => `Add a realistic ${style || "well-groomed full beard"} to the face. Match natural hair color, density and skin tone. Keep all other features unchanged.` },
  botox_simulator: { cost: 7, prompt: ({ area }) => `Simulate cosmetic botox/filler results on ${area || "forehead and around eyes"}. Smooth wrinkles realistically without overdoing it, slightly lifted brows. Keep identity intact. Photorealistic.` },
  uv_heatmap: { cost: 6, prompt: () => `Overlay a UV-damage heatmap on the face: red/orange in heavily sun-damaged areas (cheekbones, forehead, nose bridge), yellow in moderate, green in healthy zones. Semi-transparent overlay over original photo. Add small legend in bottom-right.` },
  healthy_lifestyle: { cost: 6, prompt: ({ years }) => `Show this face after ${years || 10} years of optimal healthy lifestyle: glowing skin, fit appearance, bright eyes, minimal wrinkles. Photorealistic.` },
  unhealthy_lifestyle: { cost: 6, prompt: ({ years }) => `Show this face after ${years || 10} years of poor lifestyle (smoking, sun damage, stress, poor sleep): premature wrinkles, dull skin, dark circles, sallow tone. Photorealistic.` },
  genetic_twin: { cost: 7, prompt: ({ ethnicity }) => `Generate a photorealistic portrait of a "genetic twin" — a different person who shares strong facial bone structure, eye shape, nose and lip proportions with the person in this photo${ethnicity ? `, with ${ethnicity} appearance` : ""}. Different hair, different styling, neutral studio background. Same age range.` },
  photo_colorize: { cost: 12, prompt: () => `Colorize this old black-and-white or sepia photograph with realistic, period-accurate colors. Natural skin tones, believable clothing and scenery colors. Keep every detail, composition and grain structure identical. Photorealistic result.` },
  photo_repair: { cost: 12, prompt: () => `Restore this damaged old photograph: remove scratches, dust, stains, creases and tears, repair missing areas naturally. Keep the original composition, subjects and tonality unchanged. Photorealistic restoration.` },
  photo_enhance: { cost: 12, prompt: () => `Enhance this photograph: increase sharpness and clarity, reduce noise and blur, improve contrast and dynamic range, recover fine detail. Do not change composition, colors or content. Photorealistic.` },
  photo_colorize_pro: { cost: 16, prompt: ({ era }) => `Professionally colorize this black-and-white photograph with era-accurate colors for the ${era || "original"} period. Use historically correct clothing dyes, materials, skin tones and environment colors. Preserve all detail, grain and composition exactly. Museum-quality photorealistic colorization.` },
  bg_remove: { cost: 3, prompt: () => `Remove the background completely from this image. Keep only the main subject with clean, precise edges (including fine details like hair). Place the subject on a plain solid white background. Do not alter the subject itself.` },
  face_enhance: { cost: 3, prompt: () => `Enhance the faces in this photo: sharpen facial detail, reduce noise and blur, improve skin texture naturally and fix lighting. Keep identity, expression, composition and background unchanged. Photorealistic.` },
  mood_emotion: { cost: 5, prompt: ({ mood }) => `Re-render this face expressing the emotion: ${mood || "joyful happiness"}. Adjust facial muscles, mouth, eyes and brows naturally. Keep identity, hair, lighting and background unchanged. Photorealistic.` } };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI gateway not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    let payload: any;
    try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const { action, sourceUrl, sourceUrl2, params } = payload || {};
    if (!action || !(action in ACTIONS)) return json({ error: "Unknown action" }, 400);
    if (!sourceUrl || typeof sourceUrl !== "string") return json({ error: "Missing sourceUrl" }, 400);

    const cfg = ACTIONS[action];

    // Atomic credit deduction (unified ai_credits pool + ledger)
    const { data: deducted, error: deductError } = await supabase.rpc("spend_unified_ai_credits_for_user" as any, {
      p_user_id: user.id,
      p_amount: cfg.cost,
      p_reason: `future_face_${action}`,
      p_source: "future-face-image",
    });
    if (deductError) { console.error("deduct error:", deductError); return json({ error: `Credit deduction failed: ${deductError.message}` }, 500); }
    if (!deducted) return json({ error: `Insufficient credits. Need ${cfg.cost}.` }, 402);

    // Fetch source image(s) and send to Lovable AI Gateway (image-to-image)
    async function fetchAsBlob(url: string): Promise<Blob> {
      if (url.startsWith("data:")) {
        const m = url.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) throw new Error("Invalid data URL");
        const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
        return new Blob([bytes], { type: m[1] });
      }
      // Storage objects (public/sign URLs or raw bucket paths) are downloaded with
      // the service role — private buckets can't be fetched over plain HTTP.
      const st = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?.*)?$/);
      if (st) {
        const { data, error } = await supabase.storage.from(st[1]).download(decodeURIComponent(st[2]));
        if (error || !data) throw new Error(`Source download failed: ${error?.message ?? "no data"}`);
        return data;
      }
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Source fetch failed ${r.status}`);
      return await r.blob();
    }

    async function toDataUrl(url: string): Promise<string> {
      if (url.startsWith("data:")) return url;
      const blob = await fetchAsBlob(url);
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 8192) {
        bin += String.fromCharCode(...buf.subarray(i, i + 8192));
      }
      return `data:${blob.type || "image/png"};base64,${btoa(bin)}`;
    }

    const refund = async () => {
      try {
        const { data: cur } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
        await supabase.from("ai_credits").update({ credits_remaining: (cur?.credits_remaining || 0) + cfg.cost }).eq("user_id", user.id);
      } catch (_) {}
    };

    const extractImage = (d: any): string | undefined => {
      const m0 = d?.choices?.[0]?.message;
      const chatImg =
        m0?.images?.[0]?.image_url?.url ||
        (Array.isArray(m0?.content)
          ? m0.content.find((c: any) => c?.type === "image_url")?.image_url?.url
          : undefined);
      const b64x = d?.data?.[0]?.b64_json;
      return b64x ? `data:image/png;base64,${b64x}` : (d?.data?.[0]?.url || chatImg);
    };

    let content: any[];
    try {
      content = [{ type: "text", text: cfg.prompt(params || {}).slice(0, 4000) }];
      content.push({ type: "image_url", image_url: { url: await toDataUrl(sourceUrl) } });
      if (sourceUrl2) content.push({ type: "image_url", image_url: { url: await toDataUrl(sourceUrl2) } });
    } catch (e: any) {
      console.error("Source image read error:", e);
      await refund();
      return json({ error: "Could not read the source image. Credits refunded." }, 502);
    }

    let aiData: any = null;
    let imageUrl: string | undefined;
    const models = ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"];

    for (const model of models) {
      let aiRes: Response;
      try {
        aiRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: {
            "Lovable-API-Key": lovableKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
          }) });
      } catch (e: any) {
        console.error("Lovable image edit fetch error:", model, e);
        continue;
      }

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error("Lovable image error:", model, aiRes.status, errText);
        if (aiRes.status === 429) {
          await refund();
          return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
        }
        if (aiRes.status === 402) {
          await refund();
          return json({ error: "AI credits exhausted. Please try again later." }, 402);
        }
        continue;
      }

      aiData = await aiRes.json();
      imageUrl = extractImage(aiData);
      if (imageUrl) break;
      console.error("No image in AI response", model, JSON.stringify(aiData).slice(0, 800));
    }

    if (!imageUrl) {
      await refund();
      return json({ error: "The AI could not generate an image for this photo. Credits refunded — try another photo." }, 502);
    }

    const msg = aiData?.choices?.[0]?.message;
    const chatImg =
      msg?.images?.[0]?.image_url?.url ||
      (Array.isArray(msg?.content)
        ? msg.content.find((c: any) => c?.type === "image_url")?.image_url?.url
        : undefined);
    const b64 = aiData?.data?.[0]?.b64_json;
    const urlResp = aiData?.data?.[0]?.url;
    const imageUrl: string | undefined = b64
      ? `data:image/png;base64,${b64}`
      : (urlResp || chatImg);
    if (!imageUrl) {
      console.error("No image in AI response", JSON.stringify(aiData).slice(0, 800));
      try {
        const { data: cur } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
        await supabase.from("ai_credits").update({ credits_remaining: (cur?.credits_remaining || 0) + cfg.cost }).eq("user_id", user.id);
      } catch (_) {}
      return json({ error: "No image returned. Credits refunded." }, 502);
    }


    // Decode base64 data URL and upload to storage
    const m = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    let resultUrl = imageUrl;
    if (m) {
      const mime = m[1];
      const ext = mime.split("/")[1] || "png";
      const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
      const path = `${user.id}/${action}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("future-face-photos").upload(path, bytes, { contentType: mime, upsert: false });
      if (upErr) console.error("storage upload error:", upErr);
      else {
        // Sign with the service-role client. The bucket is private and client-side
        // signing can be blocked by unrelated storage RLS helper permissions.
        const { data: signed, error: signError } = await supabase.storage
          .from("future-face-photos")
          .createSignedUrl(path, 7200);
        if (signError || !signed?.signedUrl) {
          console.error("result signing error:", signError);
          return json({ error: "Generated image could not be opened" }, 500);
        }
        resultUrl = signed.signedUrl;
      }
    }

    // Save history
    try {
      await supabase.from("future_face_images").insert({
        user_id: user.id, action, source_url: sourceUrl, result_url: resultUrl, metadata: params || {} });
    } catch (e) { console.error("history insert failed:", e); }

    return json({ resultUrl, action, creditsUsed: cfg.cost });
  } catch (error: any) {
    console.error("future-face-image error:", error);
    return json({ error: error?.message || "Internal error" }, 500);
  }
});
