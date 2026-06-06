import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: u } = await userClient.auth.getUser();
    if (!u.user) throw new Error("Unauthorized");

    const { jobId, jobTitle, jobDescription, candidates: rawCandidates } = await req.json();
    if (!jobId || !Array.isArray(rawCandidates) || rawCandidates.length === 0) {
      throw new Error("Invalid input");
    }
    // DoS protection: cap candidates and field sizes
    const candidates = rawCandidates.slice(0, 50).map((c: any) => ({
      candidate_id: String(c.candidate_id ?? c.id ?? "").slice(0, 64),
      name: String(c.name ?? "").slice(0, 120),
      headline: String(c.headline ?? "").slice(0, 200),
      skills: Array.isArray(c.skills) ? c.skills.slice(0, 30) : [],
      experience: String(c.experience ?? "").slice(0, 1000),
    }));

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const prompt = `You are an expert recruiter. Rank these candidates for the role.

Job: ${jobTitle}
Description: ${jobDescription || "N/A"}

Candidates (JSON):
${JSON.stringify(candidates, null, 2)}

Return ONLY a JSON array, sorted best→worst, each item:
{"candidate_id":"...","score":0-100,"reasoning":"...","strengths":["..."],"concerns":["..."]}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert hiring AI. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI error ${aiRes.status}: ${t}`);
    }
    const aiJson = await aiRes.json();
    const content: string = aiJson.choices?.[0]?.message?.content ?? "[]";
    const cleaned = content.replace(/```json|```/g, "").trim();
    const rankings = JSON.parse(cleaned);

    // Save rankings
    const rows = rankings.map((r: any, idx: number) => ({
      job_id: jobId,
      candidate_id: r.candidate_id,
      employer_id: u.user.id,
      score: r.score,
      rank_position: idx + 1,
      reasoning: r.reasoning,
      strengths: r.strengths || [],
      concerns: r.concerns || [],
    }));

    const { error } = await supabase.from("ai_candidate_rankings").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ rankings }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
