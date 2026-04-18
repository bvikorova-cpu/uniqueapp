import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 8;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: { user }, error } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (error || !user) throw new Error("Unauthorized");

    const { selfie_data_url } = await req.json();
    if (!selfie_data_url || !selfie_data_url.startsWith("data:image/")) {
      throw new Error("Valid selfie image (data URL) required");
    }

    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    const remaining = credits?.credits_remaining || 0;
    if (remaining < COST) throw new Error(`Insufficient credits. Need ${COST}, have ${remaining}.`);

    // Upload selfie
    let selfieUrl: string | null = null;
    try {
      const matches = selfie_data_url.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const bin = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0));
        const filePath = `${user.id}/selfie-${Date.now()}.${matches[1].split("/")[1]}`;
        const { error: upErr } = await supabase.storage.from("wellness-ai").upload(filePath, bin, { contentType: matches[1], upsert: true });
        if (!upErr) {
          const { data: pub } = supabase.storage.from("wellness-ai").getPublicUrl(filePath);
          selfieUrl = pub.publicUrl;
        }
      }
    } catch (e) { console.error("Selfie upload failed:", e); }

    // Analyze with Lovable AI vision
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this person's facial expression and visible signs of stress, fatigue, and mood. Provide a compassionate wellness assessment. This is for a wellness app — be supportive, never diagnostic." },
            { type: "image_url", image_url: { url: selfie_data_url } },
          ],
        }],
        tools: [{
          type: "function",
          function: {
            name: "analyze_mood",
            description: "Return structured mood/wellness analysis",
            parameters: {
              type: "object",
              properties: {
                detected_mood: { type: "string", description: "One of: calm, stressed, tired, anxious, happy, neutral, sad, energetic" },
                stress_level: { type: "integer", minimum: 0, maximum: 100 },
                fatigue_level: { type: "integer", minimum: 0, maximum: 100 },
                emotion_breakdown: {
                  type: "object",
                  properties: {
                    happiness: { type: "integer", minimum: 0, maximum: 100 },
                    calm: { type: "integer", minimum: 0, maximum: 100 },
                    energy: { type: "integer", minimum: 0, maximum: 100 },
                    tension: { type: "integer", minimum: 0, maximum: 100 },
                  },
                  required: ["happiness", "calm", "energy", "tension"],
                },
                ai_insight: { type: "string", description: "2-3 warm sentences about what you observe" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tool: { type: "string", description: "One of: breathing, grounding, sounds, bodyscan, sleep, journal, mandala, meditation" },
                      reason: { type: "string" },
                    },
                    required: ["tool", "reason"],
                  },
                  minItems: 2, maxItems: 4,
                },
              },
              required: ["detected_mood", "stress_level", "fatigue_level", "emotion_breakdown", "ai_insight", "recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_mood" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      if (aiResp.status === 429) throw new Error("AI rate limit exceeded.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted.");
      throw new Error("Mood analysis failed");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");
    const parsed = JSON.parse(toolCall.function.arguments);

    const { data: row, error: insErr } = await supabase.from("wellness_mood_mirror").insert({
      user_id: user.id,
      selfie_url: selfieUrl,
      detected_mood: parsed.detected_mood,
      stress_level: parsed.stress_level,
      fatigue_level: parsed.fatigue_level,
      emotion_breakdown: parsed.emotion_breakdown,
      recommendations: parsed.recommendations,
      ai_insight: parsed.ai_insight,
      credits_used: COST,
    }).select().single();
    if (insErr) throw insErr;

    await supabase.from("ai_credits").update({ credits_remaining: remaining - COST, last_used_at: new Date().toISOString() }).eq("user_id", user.id);

    return new Response(JSON.stringify({ id: row.id, ...parsed, selfie_url: selfieUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("wellness-mood-mirror error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
