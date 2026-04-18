// Scheduled Monitoring — run AI re-check on monitored thread, alert if score crosses threshold
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 4;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { action, label, thread_seed, notify_email, cadence, job_id, new_messages } = await req.json();

    if (action === "create") {
      if (!label || !thread_seed) return json({ error: "label and thread_seed required" }, 400);
      const { data } = await supabase.from("lie_monitoring_jobs").insert({
        user_id: user.id, label, thread_seed: String(thread_seed).slice(0, 4000),
        notify_email, cadence: cadence || "daily",
      }).select().single();
      return json({ job: data });
    }
    if (action === "toggle") {
      if (!job_id) return json({ error: "job_id required" }, 400);
      const { data: cur } = await supabase.from("lie_monitoring_jobs").select("is_active").eq("id", job_id).eq("user_id", user.id).maybeSingle();
      await supabase.from("lie_monitoring_jobs").update({ is_active: !cur?.is_active }).eq("id", job_id).eq("user_id", user.id);
      return json({ toggled: true });
    }
    if (action === "run") {
      if (!job_id || !new_messages) return json({ error: "job_id and new_messages required" }, 400);
      const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      if (!cr || (cr.credits_remaining ?? 0) < COST) return json({ error: "Insufficient credits", required: COST }, 402);
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);
      const { data: job } = await supabase.from("lie_monitoring_jobs").select("*").eq("id", job_id).eq("user_id", user.id).maybeSingle();
      if (!job) return json({ error: "job not found" }, 404);
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You monitor a conversation for emerging deception or manipulation. Compare new messages to baseline." },
            { role: "user", content: `Baseline:\n"""${job.thread_seed}"""\n\nNew messages:\n"""${String(new_messages).slice(0, 4000)}"""\n\nReturn JSON: { current_score:number, delta_from_baseline:number, red_flags:string[], should_alert:boolean, summary:string }` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!resp.ok) return json({ error: "AI failed" }, 500);
      const aj = await resp.json();
      const results = JSON.parse(aj.choices[0].message.content);
      await supabase.from("lie_monitoring_jobs").update({
        last_run_at: new Date().toISOString(), last_alert_score: results.current_score,
      }).eq("id", job_id);
      await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
      return json({ ...results, credits_charged: COST });
    }
    if (action === "delete") {
      if (!job_id) return json({ error: "job_id required" }, 400);
      await supabase.from("lie_monitoring_jobs").delete().eq("id", job_id).eq("user_id", user.id);
      return json({ deleted: true });
    }
    return json({ error: "unknown action" }, 400);
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
