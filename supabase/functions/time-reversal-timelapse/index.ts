import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    let body: any;
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    if (body?.action === "publish_collage") {
      const imageData = body?.imageData;
      const publishStartAge = Number(body?.startAge);
      const publishEndAge = Number(body?.endAge);
      const frameCount = Number(body?.frameCount);
      if (typeof imageData !== "string" || !/^data:image\/jpeg;base64,/.test(imageData)) {
        return json({ error: "A JPEG collage is required" }, 400);
      }
      if (![publishStartAge, publishEndAge, frameCount].every(Number.isFinite) || frameCount < 1 || frameCount > 6) {
        return json({ error: "Invalid collage metadata" }, 400);
      }
      const encoded = imageData.slice(imageData.indexOf(",") + 1);
      if (encoded.length > 10_000_000) return json({ error: "Collage is too large" }, 413);
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!serviceKey) return json({ error: "Server configuration error" }, 500);
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
      const path = `${userData.user.id}/time-reversal/collage/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await admin.storage
        .from("media")
        .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
      if (uploadError) return json({ error: `Collage upload failed: ${uploadError.message}` }, 500);

      const collageUrl = admin.storage.from("media").getPublicUrl(path).data.publicUrl;
      const { error: postError } = await admin.from("time_reversal_posts").insert({
        user_id: userData.user.id,
        content: `🎞️ My full reverse-aging journey: ${publishStartAge} → ${publishEndAge} years (${frameCount} AI frames collage).`,
        image_url: collageUrl,
        age_at_post: publishEndAge,
        likes_count: 0,
        comments_count: 0,
      });
      if (postError) {
        await admin.storage.from("media").remove([path]);
        return json({ error: `Feed publishing failed: ${postError.message}` }, 500);
      }
      return json({ url: collageUrl });
    }

    const { imageUrl, startAge, endAge, frames } = body ?? {};
    if (!imageUrl || typeof imageUrl !== "string") return json({ error: "imageUrl is required" }, 400);

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI is not configured" }, 500);

    const numFrames = Number.isFinite(frames) && frames > 0 ? Math.min(Number(frames), 6) : 4;
    const sAge = Number.isFinite(startAge) ? Number(startAge) : 20;
    const eAge = Number.isFinite(endAge) ? Number(endAge) : 80;
    const count = Math.min(numFrames, 6);
    const step = count > 1 ? (eAge - sAge) / (count - 1) : 0;

    const generated: Array<{ age: number; url: string }> = [];
    let lastError = "";

    // Explicit, age-specific instructions — generic "appears N years old" prompts are
    // routinely ignored by image models, which is why frame labels did not match faces.
    const ageBrief = (age: number) => {
      if (age <= 6) return "a small young child (kindergarten age), round soft baby-like face, chubby cheeks, very smooth skin, small childlike facial proportions, no makeup, no facial hair";
      if (age <= 12) return "a pre-teen child, clearly childlike face with large eyes relative to the face, soft round cheeks, flawless smooth skin, no makeup, no wrinkles, thin childlike neck";
      if (age <= 17) return "a teenager, youthful slim face, smooth skin, slightly childlike proportions, minimal or no makeup, no wrinkles";
      if (age <= 29) return "a young adult in their twenties, fully smooth taut skin, no wrinkles, firm jawline, youthful glow";
      if (age <= 44) return "an adult in their thirties or early forties, healthy skin with only very faint expression lines";
      if (age <= 59) return "middle aged, visible forehead and eye wrinkles, slightly softer jawline, some grey strands in the hair";
      if (age <= 74) return "elderly, clearly wrinkled skin, deep nasolabial folds, sagging cheeks, mostly grey or white hair";
      return "very elderly (80+), deeply wrinkled thin skin, age spots, hollow cheeks, white hair, drooping eyelids";
    };

    const callModel = async (model: string, age: number) =>
      await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(55_000),
        headers: {
          "Lovable-API-Key": lovableKey,
          "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          modalities: ["image", "text"],
          messages: [{
            role: "user",
            content: [
              { type: "text", text: `Re-render this portrait of the SAME person at EXACTLY ${age} years old. The result must unmistakably read as ${age} years old: ${ageBrief(age)}. Keep the same identity, ethnicity, eye colour, pose, framing and lighting. Photorealistic portrait photo, natural anatomically correct aging for age ${age}. Do NOT keep the current apparent age.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ] }] }) });

    // Frames are generated in PARALLEL — sequential generation of 4-6 frames
    // exceeded the 150s edge idle timeout (504 IDLE_TIMEOUT).
    let rateLimited = false;
    let creditsExhausted = false;

    const genFrame = async (age: number) => {
      for (const model of ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"]) {
        try {
          const res = await callModel(model, age);

          if (res.status === 429) { rateLimited = true; await res.text(); return null; }
          if (res.status === 402) { creditsExhausted = true; await res.text(); return null; }

          if (!res.ok) {
            lastError = `${model} ${res.status}: ${(await res.text()).slice(0, 500)}`;
            console.error("gateway error", lastError);
            continue;
          }

          const data = await res.json();
          const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (url) return { age, url };
          lastError = `${model}: no image in response ${JSON.stringify(data).slice(0, 500)}`;
          console.error(lastError);
        } catch (err) {
          lastError = `${model}: ${String((err as any)?.message ?? err)}`;
          console.error("frame generation failed", age, lastError);
        }
      }
      return null;
    };

    const ages = Array.from({ length: count }, (_, i) => Math.round(sAge + step * i));
    const results = await Promise.all(ages.map((age) => genFrame(age)));
    for (const r of results) if (r) generated.push(r);
    generated.sort((a, b) => a.age - b.age);

    if (!generated.length && rateLimited) return json({ error: "rate_limited", message: "AI is busy, please retry in a moment." }, 429);
    if (!generated.length && creditsExhausted) return json({ error: "credits_exhausted", message: "AI credits exhausted." }, 402);

    if (!generated.length) {
      return json({ error: "generation_failed", message: "Could not generate frames. Please try again.", detail: lastError.slice(0, 300) }, 502);
    }


    return json({ frames: generated, startAge: sAge, endAge: eAge });
  } catch (e: any) {
    const msg = e?.message || String(e);
    const status = /unauth/i.test(msg) ? 401 : /required|invalid/i.test(msg) ? 400 : 500;
    return json({ error: msg }, status);
  }
});
