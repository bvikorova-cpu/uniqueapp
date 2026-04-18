import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VOICE_COST = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { transcript, category } = await req.json();
    if (!transcript) return new Response(JSON.stringify({ error: "Missing transcript" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: credits } = await supabase
      .from("creative_forge_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < VOICE_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: VOICE_COST }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formats: Record<string, string> = {
      song_lyrics: "Format as song lyrics with [Verse], [Chorus], [Bridge] sections.",
      screenplay: "Format as Hollywood screenplay with INT./EXT. scene headings, character names in caps, action lines and dialogue.",
      theater_play: "Format as a theater play with stage directions in italics, ACT/SCENE numbering, and character dialogue.",
      novel_chapter: "Format as a polished novel chapter with descriptive prose and dialogue.",
      poetry: "Format as a structured poem with stanzas.",
      standup: "Format as a stand-up routine with setups and punchlines.",
      podcast_script: "Format as a podcast script with INTRO, SEGMENTS, and OUTRO.",
      ad_copy: "Format as persuasive ad copy with headline, body and CTA.",
    };

    const systemPrompt = `You are a professional writer. Transform a brainstormed voice transcript (often messy, with um's and tangents) into a polished ${category.replace("_", " ")} draft.
${formats[category] || ""}
Extract the core idea, organize it cleanly, expand thin areas, and remove filler. Return ONLY the formatted draft.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Voice transcript:\n\n${transcript}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 401) return new Response(JSON.stringify({ error: "Invalid OpenAI key" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errText = await aiResponse.text();
      console.error("OpenAI error:", aiResponse.status, errText);
      throw new Error("OpenAI API error");
    }

    const data = await aiResponse.json();
    const script = data.choices?.[0]?.message?.content || "";

    await supabase.from("creative_forge_credits").update({
      credits_remaining: credits.credits_remaining - VOICE_COST,
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ script, creditsUsed: VOICE_COST, creditsRemaining: credits.credits_remaining - VOICE_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-to-script error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
