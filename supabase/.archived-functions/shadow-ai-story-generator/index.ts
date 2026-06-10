import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORY_COST = 4;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
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

    const { prompt, tone = "gothic", length = "medium", generateImage = true } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Check credits
    const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < STORY_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: STORY_COST }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const lengthMap: Record<string, string> = {
      short: "exactly 150-200 words",
      medium: "exactly 350-450 words",
      long: "exactly 700-900 words",
    };
    const toneMap: Record<string, string> = {
      gothic: "Victorian gothic horror with elegant prose, candlelight, decaying mansions",
      psychological: "psychological horror with unreliable narrator and creeping dread",
      cosmic: "cosmic Lovecraftian horror with incomprehensible entities",
      slasher: "fast-paced visceral slasher with chase scenes",
      supernatural: "haunting supernatural ghost story",
      folk: "folk horror with rural rituals and ancient evil",
    };

    const systemPrompt = `You are a master horror author writing in the style of ${toneMap[tone] || toneMap.gothic}.
Generate a complete, polished horror story (${lengthMap[length] || lengthMap.medium}).
Return JSON with: { "title": "evocative title", "story": "full story text" }.
The story must have a strong opening hook, atmospheric build-up, and chilling ending.`;

    // Generate story via OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "OpenAI rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResponse.text();
      console.error("OpenAI error:", aiResponse.status, t);
      throw new Error("OpenAI API error");
    }

    const data = await aiResponse.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const generatedTitle = parsed.title;
    const generatedStory = parsed.story;

    // Generate atmospheric illustration via OpenAI (gpt-image-1)
    let illustrationUrl: string | null = null;
    if (generateImage) {
      try {
        const imgPrompt = `Cinematic gothic horror illustration for: "${generatedTitle}". ${prompt.slice(0, 200)}. Dark moody atmospheric, deep shadows, crimson accents, painterly oil texture, no text, no watermark.`;
        const imgResp = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: imgPrompt,
        n: 1,
        size: "1024x1024",
          }),
        });
        if (imgResp.ok) {
          const imgData = await imgResp.json();
          illustrationUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
        } else {
          console.warn("Image gen failed", imgResp.status);
        }
      } catch (e) {
        console.warn("Image gen exception", e);
      }
    }

    // Save story
    const { data: saved } = await supabase.from("shadow_ai_stories").insert({
      user_id: user.id,
      prompt,
      generated_title: generatedTitle,
      generated_story: generatedStory,
      illustration_url: illustrationUrl,
      tone,
      length,
      credits_used: STORY_COST,
    }).select().single();

    // Deduct credits
    await supabase.from("shadow_arena_credits").update({
      credits_remaining: credits.credits_remaining - STORY_COST,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({
      story: saved,
      creditsRemaining: credits.credits_remaining - STORY_COST,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("story-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
