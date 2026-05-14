import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireAiCredits(req, corsHeaders, { credits: 3, usageType: "ai_resume_parse" });
    if (auth.errorResponse) return auth.errorResponse;
    const { resumeText } = await req.json();
    if (!resumeText || resumeText.length < 30) {
      return new Response(JSON.stringify({ error: "Resume text too short" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("AI not configured");

    const prompt = `Extract structured data from this resume. Return ONLY JSON, no markdown:
{
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1","skill2"],
  "years_experience": <number>,
  "experience": [{"title":"","company":"","duration":"","description":""}],
  "education": [{"degree":"","institution":"","year":""}]
}

RESUME:
${resumeText.slice(0, 8000)}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      }),
    });
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    await auth.deduct!().catch((e) => console.error("deduct:", e));
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
