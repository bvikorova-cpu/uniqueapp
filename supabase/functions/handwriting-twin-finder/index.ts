import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 5;

// Cosine similarity for trait vectors
function cosine(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const av = a[k] ?? 0, bv = b[k] ?? 0;
    dot += av * bv; na += av * av; nb += bv * bv;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { imageUrl, displayName, isPublic = true } = await req.json();
    if (!imageUrl || !displayName) return json({ error: "imageUrl and displayName required" }, 400);
    const { data: credits } = await supabase.from("handwriting_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < COST) return json({ error: "Insufficient credits" }, 402);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Extract a numeric trait vector for handwriting matching. Return JSON: { vector: { slant, pressure, size, spacing, loops, angularity, speed, regularity, baseline, creativity, extroversion, analytical }, summary: string } where each value is 0..100." },
          { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return json({ error: "Rate limited" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    const ai = await aiRes.json();
    const parsed = JSON.parse(ai.choices[0].message.content);

    await supabase.from("handwriting_twin_profiles").upsert({
      user_id: user.id, display_name: displayName, sample_url: imageUrl,
      trait_vector: parsed.vector, is_public: isPublic, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    const { data: others } = await supabase.from("handwriting_twin_profiles")
      .select("user_id, display_name, sample_url, trait_vector").neq("user_id", user.id).eq("is_public", true).limit(200);
    const matches = (others ?? []).map(o => ({
      ...o, similarity: Math.round(cosine(parsed.vector, o.trait_vector as any) * 100),
    })).sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    await supabase.from("handwriting_credits").update({ credits_remaining: credits.credits_remaining - COST }).eq("user_id", user.id);
    return json({ matches, your_summary: parsed.summary });
  } catch (e) { console.error(e); return json({ error: String(e) }, 500); }
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
