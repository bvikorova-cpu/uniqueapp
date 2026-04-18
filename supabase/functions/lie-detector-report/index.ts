// Truth Report PDF — generates a polished narrative report (HTML/text) from any prior analysis
// PDF rendering happens client-side via jsPDF, this function provides the formatted narrative.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { source_type, source_id, payload, title } = await req.json();
    if (!source_type || !payload) return json({ error: "source_type and payload required" }, 400);

    const { data: cr } = await supabase
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) {
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a forensic report writer. Produce a professional, neutral, court/HR-appropriate narrative report. Do NOT make absolute claims — phrase findings as analytical observations and probabilities.",
          },
          {
            role: "user",
            content: `Generate a structured report for source_type="${source_type}".\n\nAnalysis payload:\n${JSON.stringify(payload, null, 2)}\n\nReturn strict JSON with keys: title (string), executive_summary (string), key_findings (string[]), evidence_breakdown (string[]), risk_assessment (string), recommended_actions (string[]), legal_disclaimer (string).`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return json({ error: "OpenAI failed", details: t }, 500);
    }
    const aj = await resp.json();
    const report = JSON.parse(aj.choices[0].message.content);

    await supabase
      .from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    const { data: saved } = await supabase
      .from("lie_detector_reports")
      .insert({
        user_id: user.id,
        source_type,
        source_id: source_id || null,
        title: title || report.title || "Truth Analysis Report",
        credits_used: COST,
      })
      .select()
      .single();

    return json({ report, record: saved });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
