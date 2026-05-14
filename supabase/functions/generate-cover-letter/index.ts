import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireAiCredits(req, corsHeaders, { credits: 4, usageType: "ai_cover_letter" });
    if (auth.errorResponse) return auth.errorResponse;
    const { jobTitle, jobDescription, companyName, candidateSummary, candidateSkills, tone } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("AI not configured");

    const prompt = `Write a personalized cover letter (250-350 words, ${tone || "professional"} tone).

JOB: ${jobTitle} at ${companyName}
DESCRIPTION: ${(jobDescription || "").slice(0, 2000)}

CANDIDATE SUMMARY: ${candidateSummary || "Experienced professional"}
KEY SKILLS: ${(candidateSkills || []).join(", ")}

Format: greeting, opening hook, 1-2 body paragraphs matching candidate to role, closing CTA. No placeholders like [Your Name].`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 800,
      }),
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    await auth.deduct!().catch((e) => console.error("deduct:", e));
    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
