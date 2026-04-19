import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { lessonId, action, quizScore } = await req.json();

    if (action === "complete") {
      const xp = Math.max(10, Math.round((quizScore ?? 50) / 10) * 5);
      await supabase.from("handwriting_academy_progress").upsert({
        user_id: user.id, lesson_id: lessonId, completed: true,
        quiz_score: quizScore, xp_earned: xp, completed_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });
      return json({ ok: true, xp_earned: xp });
    }

    if (action === "generate-quiz") {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Generate a 5-question multiple-choice graphology quiz. Return JSON: { questions: [{ q, options: [string,string,string,string], correct: 0-3 }] }." },
            { role: "user", content: `Lesson topic: ${lessonId}` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (aiRes.status === 429) return json({ error: "Rate limited" }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
      const ai = await aiRes.json();
      return json(JSON.parse(ai.choices[0].message.content));
    }

    const { data } = await supabase.from("handwriting_academy_progress").select("*").eq("user_id", user.id);
    return json({ progress: data ?? [] });
  } catch (e) { console.error(e); return json({ error: String(e) }, 500); }
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
