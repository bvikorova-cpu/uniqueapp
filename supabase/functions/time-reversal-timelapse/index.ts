import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // ---- Auth guard ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    // ---- Body parsing ----
    let body: any;
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    const { imageUrl, startAge, endAge, frames } = body ?? {};
    if (!imageUrl || typeof imageUrl !== "string") {
      return json({ error: "imageUrl is required" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return json({ error: "OpenAI API key not configured" }, 500);

    const numFrames = Number.isFinite(frames) && frames > 0 ? Math.min(frames, 8) : 8;
    const sAge = Number.isFinite(startAge) ? startAge : 20;
    const eAge = Number.isFinite(endAge) ? endAge : 80;
    const ageStep = (eAge - sAge) / (numFrames - 1);
    const generatedFrames: Array<{ age: number; url: string }> = [];

    for (let i = 0; i < Math.min(numFrames, 4); i++) {
      const age = Math.round(sAge + ageStep * i * (numFrames / 4));

      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Portrait photo of a person at age ${age}. Professional headshot, neutral background, natural aging progression. Photorealistic.`,
          n: 1,
          size: "1024x1024",
        }),
      });

      const data = await res.json();
      if (data.data?.[0]?.url) generatedFrames.push({ age, url: data.data[0].url });
    }

    return json({ frames: generatedFrames, startAge: sAge, endAge: eAge });
  } catch (e: any) {
    const msg = e?.message || String(e);
    const status = /unauth/i.test(msg) ? 401 : /required|invalid/i.test(msg) ? 400 : 500;
    return json({ error: msg }, status);
  }
});
