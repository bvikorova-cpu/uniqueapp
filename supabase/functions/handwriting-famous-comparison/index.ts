import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { imageUrl } = await req.json();
    if (!imageUrl) return json({ error: "imageUrl required" }, 400);
    const { data: credits } = await supabase.from("handwriting_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < COST) return json({ error: "Insufficient credits" }, 402);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Compare handwriting to famous historical figures (Einstein, Napoleon, Mozart, Marie Curie, Tesla, Da Vinci, Picasso, Hemingway). Pick best match. Return JSON: { matched_figure: string, match_score: 0-100, shared_traits: string[], ai_blurb: short fun paragraph }." },
          { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return json({ error: "Rate limited" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    const ai = await aiRes.json();
    const parsed = JSON.parse(ai.choices[0].message.content);
    await supabase.from("handwriting_credits").update({ credits_remaining: credits.credits_remaining - COST }).eq("user_id", user.id);
    const { data: row } = await supabase.from("handwriting_famous_comparisons").insert({
      user_id: user.id, image_url: imageUrl,
      matched_figure: parsed.matched_figure, match_score: parsed.match_score,
      shared_traits: parsed.shared_traits, ai_blurb: parsed.ai_blurb, credits_used: COST,
    }).select().single();
    return json({ comparison: row });
  } catch (e) { console.error(e); return json({ error: String(e) }, 500); }
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
