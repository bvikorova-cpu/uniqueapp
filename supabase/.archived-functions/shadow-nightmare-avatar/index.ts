import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AVATAR_COST = 8;

const STYLE_PROMPTS: Record<string, string> = {
  vampire: "Transform this person into an elegant Victorian vampire: pale skin, deep red eyes, fangs subtly visible, gothic clothing, candlelit background, painterly portrait, no text",
  ghost: "Transform this person into an ethereal ghost: translucent skin, hollow glowing eyes, wisps of fog around shoulders, faded edges, moonlight, no text",
  zombie: "Transform this person into a movie-quality zombie: decaying skin with cracks, milky eyes, dirt and blood smudges, atmospheric lighting, cinematic horror, no text",
  demon: "Transform this person into a horned demon: red-burnished skin, glowing amber eyes, ornate horns, dark fantasy portrait, dramatic shadow lighting, no text",
  witch: "Transform this person into a gothic witch: dark hood, glowing rune marks on cheek, mysterious smoke, candlelit eerie portrait, painterly, no text",
  cursed_doll: "Transform this person into a cursed porcelain doll: cracked porcelain skin, button-style eyes, Victorian dress collar, eerie smile, dim attic lighting, no text",
  shadow_being: "Transform this person into a shadow being: face fades into living darkness, glowing red eyes, smoke for hair, void background, no text",
  werewolf: "Transform this person mid-transformation into a werewolf: partial fur on face, glowing yellow eyes, sharp teeth visible, full moon backlight, cinematic, no text",
};

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

    const { sourceImageUrl, style = "vampire" } = await req.json();
    if (!sourceImageUrl) return new Response(JSON.stringify({ error: "Missing sourceImageUrl" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.vampire;

    const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < AVATAR_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: AVATAR_COST }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Edit image via OpenAI gpt-image-1
    const aiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: stylePrompt },
              { type: "image_url", image_url: { url: sourceImageUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("OpenAI error:", aiResponse.status, t);
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "AI rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted in workspace" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI image error");
    }

    const data = await aiResponse.json();
    const nightmareImageDataUrl = (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);
    if (!nightmareImageDataUrl) throw new Error("No image returned");

    // Upload generated image to storage bucket
    const base64Data = nightmareImageDataUrl.split(",")[1];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `${user.id}/nightmare-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("shadow-nightmare-avatars")
      .upload(fileName, binaryData, { contentType: "image/png", upsert: false });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to store nightmare avatar");
    }
    const { data: pub } = supabase.storage.from("shadow-nightmare-avatars").getPublicUrl(fileName);

    const { data: saved } = await supabase.from("shadow_nightmare_avatars").insert({
      user_id: user.id,
      source_image_url: sourceImageUrl,
      nightmare_image_url: pub.publicUrl,
      style,
      credits_used: AVATAR_COST,
    }).select().single();

    await supabase.from("shadow_arena_credits").update({
      credits_remaining: credits.credits_remaining - AVATAR_COST,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({
      avatar: saved,
      nightmareImageUrl: pub.publicUrl,
      creditsRemaining: credits.credits_remaining - AVATAR_COST,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("nightmare-avatar error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
