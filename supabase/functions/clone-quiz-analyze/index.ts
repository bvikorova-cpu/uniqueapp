// Analyzes personality quiz answers via Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return j({ error: "No auth" }, 401);
    const { questions, answers } = await req.json();
    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return j({ error: "questions and answers arrays required (same length)" }, 400);
    }

    const qa = questions.map((q: string, i: number) => `Q: ${q}\nA: ${answers[i]}`).join("\n\n");

    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) return j({ error: "AI not configured" }, 500);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a personality analyst. Given quiz Q&A, return ONLY a JSON object with keys: archetype (string, 2-4 words), summary (1-2 sentences), traits (array of exactly 4 short strings), recommended_clone_tone (one of: friendly, professional, humorous, intellectual, empathetic). No markdown, no code fences." },
          { role: "user", content: qa },
        ],
      }),
    });
    if (res.status === 429) return j({ error: "Rate limit exceeded" }, 429);
    if (res.status === 402) return j({ error: "AI credits exhausted" }, 402);
    if (!res.ok) return j({ error: "AI error" }, 500);
    const data = await res.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "{}";
    content = content.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(content); }
    catch { parsed = { archetype: "Curious Mind", summary: content.slice(0, 200), traits: [], recommended_clone_tone: "friendly" }; }
    return j(parsed);
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
