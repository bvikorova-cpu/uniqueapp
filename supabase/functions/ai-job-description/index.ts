import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { title, company, level, skills, tone = "professional", language = "English", remote = false } = await req.json();
    if (!title) return new Response(JSON.stringify({ error: "title required" }), { status: 400, headers: corsHeaders });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), { status: 500, headers: corsHeaders });

    const prompt = `Write a complete job description in ${language} for the role "${title}"${company ? ` at ${company}` : ""}.
Level: ${level || "any"}. Remote: ${remote ? "yes" : "no/hybrid"}. Tone: ${tone}.
Required skills: ${(skills || []).join(", ") || "to be inferred"}.

Structure with markdown headings:
## About the role
## Responsibilities (5-8 bullets)
## Requirements (5-8 bullets)
## Nice to have
## What we offer (benefits + growth)
## Diversity statement (1 short paragraph, inclusive)

Be concrete, avoid clichés ("rockstar", "ninja"), no salary unless provided. End with a single CTA line.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t }), { status: 502, headers: corsHeaders });
    }
    const data = await res.json();
    const result = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
