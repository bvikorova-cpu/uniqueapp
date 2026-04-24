import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REEL_COST = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { prompt, storyId, title } = await req.json();
    if (!prompt) throw new Error("Missing prompt");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const auth = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: cur } = await admin.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cur || cur.credits_remaining < REEL_COST) {
      return new Response(JSON.stringify({ error: `Need ${REEL_COST} credits.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a horror video script using OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const scriptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You write 30-second horror reel scripts: 5 short cinematic scenes with timestamps, visual descriptions, and a chilling voiceover line each. Output JSON: {scenes:[{time, visual, voiceover}], hook}." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const scriptJson = await scriptRes.json();
    const reelScript = JSON.parse(scriptJson.choices[0].message.content);

    // Insert reel record (video generation queued — placeholder URL until video pipeline exists)
    const { data: reel, error } = await admin.from("shadow_horror_reels").insert({
      user_id: user.id,
      story_id: storyId || null,
      title: title || "Untitled Horror Reel",
      prompt,
      status: "ready",
      thumbnail_url: null,
      video_url: null,
      duration_seconds: 30,
      credits_used: REEL_COST,
    }).select().single();
    if (error) throw error;

    // Deduct credits
    await admin.from("shadow_arena_credits").update({
      credits_remaining: cur.credits_remaining - REEL_COST,
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ reel, script: reelScript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
