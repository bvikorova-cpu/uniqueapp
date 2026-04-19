import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { referenceUrl, suspectUrl } = await req.json();
    if (!referenceUrl || !suspectUrl) return json({ error: "Two images required" }, 400);
    const { data: credits } = await supabase.from("handwriting_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < COST) return json({ error: "Insufficient credits" }, 402);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are a court-grade forensic document examiner. Compare reference vs suspect signature/handwriting. Return strict JSON: { authenticity_probability: 0-100, forgery_probability: 0-100, verdict: 'AUTHENTIC'|'LIKELY_AUTHENTIC'|'SUSPICIOUS'|'LIKELY_FORGERY'|'FORGERY', red_flags: [{trait, severity}], matching_traits: [{trait, similarity}], detailed_report: string }." },
          { role: "user", content: [
            { type: "text", text: "First image is the REFERENCE (known authentic). Second image is the SUSPECT sample." },
            { type: "image_url", image_url: { url: referenceUrl } },
            { type: "image_url", image_url: { url: suspectUrl } },
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
    const { data: row } = await supabase.from("handwriting_forgery_checks").insert({
      user_id: user.id, reference_url: referenceUrl, suspect_url: suspectUrl,
      authenticity_probability: parsed.authenticity_probability,
      forgery_probability: parsed.forgery_probability,
      verdict: parsed.verdict, red_flags: parsed.red_flags,
      matching_traits: parsed.matching_traits, detailed_report: parsed.detailed_report,
      credits_used: COST,
    }).select().single();
    return json({ check: row });
  } catch (e) { console.error(e); return json({ error: String(e) }, 500); }
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
