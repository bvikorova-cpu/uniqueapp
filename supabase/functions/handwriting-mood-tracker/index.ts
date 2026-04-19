import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { imageUrl, notes } = await req.json();
    if (!imageUrl) return json({ error: "imageUrl required" }, 400);
    const { data: credits } = await supabase.from("handwriting_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < COST) return json({ error: "Insufficient credits" }, 402);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a graphology mood analyst. Analyze handwriting for current emotional state. Return JSON: { mood_score: 0-100, stress_score: 0-100, energy_score: 0-100, focus_score: 0-100, ai_insight: short paragraph }." },
          { role: "user", content: [
            { type: "text", text: notes ? `Notes: ${notes}` : "Daily mood scan." },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return json({ error: "Rate limited" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    const ai = await aiRes.json();
    const parsed = JSON.parse(ai.choices[0].message.content);
    await supabase.from("handwriting_credits").update({ credits_remaining: credits.credits_remaining - COST }).eq("user_id", user.id);
    const { data: row } = await supabase.from("handwriting_mood_scans").insert({
      user_id: user.id, image_url: imageUrl, notes,
      mood_score: parsed.mood_score, stress_score: parsed.stress_score,
      energy_score: parsed.energy_score, focus_score: parsed.focus_score,
      ai_insight: parsed.ai_insight, credits_used: COST,
    }).select().single();
    return json({ scan: row });
  } catch (e) { console.error(e); return json({ error: String(e) }, 500); }
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
