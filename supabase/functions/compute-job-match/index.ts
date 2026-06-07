import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function score(jobText: string, skills: string[]): { score: number; reasons: string[] } {
  const lower = jobText.toLowerCase();
  const matched: string[] = [];
  for (const s of skills) {
    if (s && lower.includes(s.toLowerCase())) matched.push(s);
  }
  const skillRatio = skills.length ? matched.length / skills.length : 0;
  const base = Math.round(40 + skillRatio * 50 + Math.min(matched.length, 5) * 2);
  const reasons = matched.length
    ? [`Matched ${matched.length} of ${skills.length} skills: ${matched.slice(0, 5).join(", ")}`]
    : ["No direct skill matches found in job description"];
  return { score: Math.min(100, Math.max(0, base)), reasons };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "auth required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(
      url,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { jobId } = await req.json();
    const { data: job } = await admin.from("job_listings").select("title, description, requirements").eq("id", jobId).maybeSingle();
    if (!job) return new Response(JSON.stringify({ error: "Job not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: resume } = await admin.from("candidate_resumes").select("parsed_skills").eq("user_id", user.id).order("is_primary", { ascending: false }).limit(1).maybeSingle();
    const skills = (resume?.parsed_skills as string[] | null) || [];

    const jobText = `${job.title} ${job.description || ""} ${job.requirements || ""}`;
    const result = score(jobText, skills);

    await admin.from("job_match_scores").upsert({
      user_id: user.id,
      job_id: jobId,
      score: result.score,
      reasons: result.reasons,
      computed_at: new Date().toISOString(),
    }, { onConflict: "user_id,job_id" });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
