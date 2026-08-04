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
    const { imageUrl, startAge, endAge, frames } = body ?? {};
    if (!imageUrl || typeof imageUrl !== "string") return json({ error: "imageUrl is required" }, 400);

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI is not configured" }, 500);

    const numFrames = Number.isFinite(frames) && frames > 0 ? Math.min(Number(frames), 6) : 4;
    const sAge = Number.isFinite(startAge) ? Number(startAge) : 20;
    const eAge = Number.isFinite(endAge) ? Number(endAge) : 80;
    const count = Math.min(numFrames, 4);
    const step = count > 1 ? (eAge - sAge) / (count - 1) : 0;

    const generated: Array<{ age: number; url: string }> = [];
    let lastError = "";

    const callModel = async (model: string, age: number) =>
      await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": lovableKey,
          "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          modalities: ["image", "text"],
          messages: [{
            role: "user",
            content: [
              { type: "text", text: `Edit this portrait so the same person appears to be ${age} years old. Keep identity, pose, hair style and framing. Photorealistic, natural aging, neutral background.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ] }] }) });

    for (let i = 0; i < count; i++) {
      const age = Math.round(sAge + step * i);
      for (const model of ["google/gemini-2.5-flash-image", "google/gemini-3.1-flash-image"]) {
        try {
          const res = await callModel(model, age);

          if (res.status === 429) return json({ error: "rate_limited", message: "AI is busy, please retry in a moment." }, 429);
          if (res.status === 402) return json({ error: "credits_exhausted", message: "AI credits exhausted." }, 402);

          if (!res.ok) {
            lastError = `${model} ${res.status}: ${(await res.text()).slice(0, 500)}`;
            console.error("gateway error", lastError);
            continue;
          }

          const data = await res.json();
          const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (url) { generated.push({ age, url }); break; }
          lastError = `${model}: no image in response ${JSON.stringify(data).slice(0, 500)}`;
          console.error(lastError);
        } catch (err) {
          lastError = `${model}: ${String((err as any)?.message ?? err)}`;
          console.error("frame generation failed", age, lastError);
        }
      }
    }

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
