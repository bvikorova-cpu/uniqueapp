import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  mood_emotion: { cost: 5, prompt: ({ mood }) => `Re-render this face expressing the emotion: ${mood || "joyful happiness"}. Adjust facial muscles, mouth, eyes and brows naturally. Keep identity, hair, lighting and background unchanged. Photorealistic.` },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const lovableKey = Deno.env.get("OPENAI_API_KEY");
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

    // Atomic credit deduction
    const { data: deducted, error: deductError } = await supabase.rpc("deduct_ai_credits" as any, {
      p_user_id: user.id, p_amount: cfg.cost,
    });
    if (deductError) { console.error("deduct error:", deductError); return json({ error: "Credit deduction failed" }, 500); }
    if (!deducted) return json({ error: `Insufficient credits. Need ${cfg.cost}.` }, 402);

    // Fetch source image(s) and send to OpenAI gpt-image-1 /v1/images/edits
    async function fetchAsBlob(url: string): Promise<Blob> {
      if (url.startsWith("data:")) {
        const m = url.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) throw new Error("Invalid data URL");
        const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
        return new Blob([bytes], { type: m[1] });
      }
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Source fetch failed ${r.status}`);
      return await r.blob();
    }

    let aiRes: Response;
    try {
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", cfg.prompt(params || {}).slice(0, 4000));
      form.append("n", "1");
      form.append("size", "1024x1024");
      const b1 = await fetchAsBlob(sourceUrl);
      form.append("image", b1, "source.png");
      if (sourceUrl2) {
        const b2 = await fetchAsBlob(sourceUrl2);
        form.append("image", b2, "source2.png");
      }

      aiRes = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { "Authorization": `Bearer ${lovableKey}` },
        body: form,
      });
    } catch (e: any) {
      console.error("OpenAI image edit fetch error:", e);
      try {
        const { data: cur } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
        await supabase.from("ai_credits").update({ credits_remaining: (cur?.credits_remaining || 0) + cfg.cost }).eq("user_id", user.id);
      } catch (_) {}
      return json({ error: "Image generation failed. Credits refunded." }, 502);
    }

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("OpenAI image error:", aiRes.status, errText);
      try {
        const { data: cur } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
        await supabase.from("ai_credits").update({ credits_remaining: (cur?.credits_remaining || 0) + cfg.cost }).eq("user_id", user.id);
      } catch (_) {}
      if (aiRes.status === 429) return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
      return json({ error: "Image generation failed. Credits refunded." }, 502);
    }

    const aiData = await aiRes.json();
    const b64 = aiData?.data?.[0]?.b64_json;
    const urlResp = aiData?.data?.[0]?.url;
    const imageUrl: string | undefined = b64 ? `data:image/png;base64,${b64}` : urlResp;
    if (!imageUrl) {
      console.error("No image in AI response", JSON.stringify(aiData).slice(0, 500));
      return json({ error: "No image returned" }, 502);
    }

    // Decode base64 data URL and upload to storage
    const m = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    let publicUrl = imageUrl;
    if (m) {
      const mime = m[1];
      const ext = mime.split("/")[1] || "png";
      const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
      const path = `${user.id}/${action}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("future-face-photos").upload(path, bytes, {
        contentType: mime, upsert: false,
      });
      if (upErr) console.error("storage upload error:", upErr);
      else {
        const { data: pub } = supabase.storage.from("future-face-photos").getPublicUrl(path);
        publicUrl = pub.publicUrl;
      }
    }

    // Save history
    await supabase.from("future_face_images").insert({
      user_id: user.id, action, source_url: sourceUrl, result_url: publicUrl, metadata: params || {},
    });

    return json({ resultUrl: publicUrl, action, creditsUsed: cfg.cost });
  } catch (error: any) {
    console.error("future-face-image error:", error);
    return json({ error: error?.message || "Internal error" }, 500);
  }
});
