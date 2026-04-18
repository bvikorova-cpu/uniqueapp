// Bulk Upload — process array of messages with discount (1 cr per item, min 50 items batch)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { items, job_type } = await req.json();
    if (!Array.isArray(items) || items.length < 1) return json({ error: "items array required" }, 400);
    if (items.length > 200) return json({ error: "max 200 items per batch" }, 400);

    const COST = Math.max(items.length, 1); // 1 cr / item
    const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const { data: job } = await supabase.from("lie_bulk_jobs").insert({
      user_id: user.id, job_type: job_type || "messages", total_items: items.length, status: "processing", credits_used: COST,
    }).select().single();

    const batched = chunks(items, 20);
    const allResults: any[] = [];
    for (const batch of batched) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You score multiple messages for truthfulness. Output JSON only." },
            { role: "user", content: `Messages:\n${batch.map((m: string, i: number) => `[${i}] ${String(m).slice(0,500)}`).join("\n")}\n\nReturn JSON: { results: [{index:number, truthfulness:number, red_flags:string[], summary:string}] }` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (resp.ok) {
        const aj = await resp.json();
        const parsed = JSON.parse(aj.choices[0].message.content);
        allResults.push(...(parsed.results || []));
      }
      await supabase.from("lie_bulk_jobs").update({ processed_items: allResults.length }).eq("id", job!.id);
    }
    await supabase.from("lie_bulk_jobs").update({ status: "complete", processed_items: allResults.length, results: allResults }).eq("id", job!.id);
    await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
    return json({ job_id: job!.id, total: items.length, processed: allResults.length, results: allResults, credits_charged: COST });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function chunks<T>(a: T[], n: number) { const o: T[][] = []; for (let i=0;i<a.length;i+=n) o.push(a.slice(i,i+n)); return o; }
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
