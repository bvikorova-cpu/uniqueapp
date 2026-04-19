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
    const { analysisId, source = "main" } = await req.json();
    if (!analysisId) return json({ error: "analysisId required" }, 400);
    const { data: credits } = await supabase.from("handwriting_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < COST) return json({ error: "Insufficient credits" }, 402);

    // Generate AI exec summary for the PDF
    const tableMap: Record<string, string> = {
      main: "handwriting_analyses",
      signature: "handwriting_signature_analyses",
      forgery: "handwriting_forgery_checks",
      compatibility: "handwriting_compatibility_matches",
    };
    const tbl = tableMap[source] ?? "handwriting_analyses";
    const { data: analysis } = await supabase.from(tbl).select("*").eq("id", analysisId).eq("user_id", user.id).maybeSingle();
    if (!analysis) return json({ error: "Analysis not found" }, 404);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Write a forensic-grade executive summary for a handwriting analysis PDF report. Professional, court-ready tone, 250-400 words." },
          { role: "user", content: JSON.stringify(analysis).slice(0, 6000) },
        ],
      }),
    });
    if (aiRes.status === 429) return json({ error: "Rate limited" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    const ai = await aiRes.json();
    const summary = ai.choices[0].message.content;

    await supabase.from("handwriting_credits").update({ credits_remaining: credits.credits_remaining - COST }).eq("user_id", user.id);
    const watermark = `UniqueApp Forensic · ${user.id.slice(0, 8)} · ${new Date().toISOString().slice(0, 10)}`;
    const { data: report } = await supabase.from("handwriting_pdf_reports").insert({
      user_id: user.id, source_analysis_id: analysisId, report_type: source,
      watermark, status: "ready", credits_used: COST,
    }).select().single();
    return json({ report, summary, watermark, source_data: analysis });
  } catch (e) { console.error(e); return json({ error: String(e) }, 500); }
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
