import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const now = new Date();
    const dow = now.getUTCDay(); // 0=Sun
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - ((dow + 6) % 7)); // Monday
    weekStart.setUTCHours(0, 0, 0, 0);
    const prevStart = new Date(weekStart); prevStart.setUTCDate(prevStart.getUTCDate() - 7);

    const weekStartISO = weekStart.toISOString();
    const prevStartISO = prevStart.toISOString();
    const weekStartDate = weekStart.toISOString().slice(0, 10);

    // existing? return it
    const { data: existing } = await supabase
      .from("dating_weekly_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStartDate)
      .maybeSingle();
    if (existing) return json(existing);

    const agg = async (from: string, to: string) => {
      const [likes, matches, msgs, swipes] = await Promise.all([
        supabase.from("dating_swipes").select("id", { count: "exact", head: true })
          .eq("swiper_id", user.id).eq("direction", "like").gte("created_at", from).lt("created_at", to),
        supabase.from("dating_matches").select("id", { count: "exact", head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).gte("created_at", from).lt("created_at", to),
        supabase.from("dating_messages").select("id", { count: "exact", head: true })
          .eq("sender_id", user.id).gte("created_at", from).lt("created_at", to),
        supabase.from("dating_swipes").select("id", { count: "exact", head: true })
          .eq("swiper_id", user.id).gte("created_at", from).lt("created_at", to),
      ]);
      return {
        likes: likes.count || 0,
        matches: matches.count || 0,
        messages: msgs.count || 0,
        swipes: swipes.count || 0,
      };
    };

    const metrics = await agg(weekStartISO, new Date().toISOString());
    const prev_metrics = await agg(prevStartISO, weekStartISO);

    // AI summary + tips
    let ai_summary = "Keep showing up — consistency wins.";
    let tips: { title: string; action: string }[] = [
      { title: "Refresh your bio", action: "bio_coach" },
      { title: "Add one new photo", action: "add_photo" },
      { title: "Send 3 openers today", action: "send_openers" },
    ];

    const LOVABLE_KEY = Deno.env.get("OPENAI_API_KEY");
    if (LOVABLE_KEY) {
      try {
        const prompt = `User's dating week summary.
This week: ${JSON.stringify(metrics)}
Last week: ${JSON.stringify(prev_metrics)}
Return JSON: { "summary": "1-2 sentences, warm, specific, mention biggest change", "tips": [ {"title":"<=6 words", "action":"bio_coach|add_photo|send_openers|update_prompts|try_video"} ] } with exactly 3 tips.`;
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a friendly dating coach. Reply with JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (r.ok) {
          const j = await r.json();
          const parsed = JSON.parse(j.choices[0].message.content);
          if (parsed.summary) ai_summary = parsed.summary;
          if (Array.isArray(parsed.tips) && parsed.tips.length) tips = parsed.tips.slice(0, 3);
        }
      } catch (e) { console.error("ai err", e); }
    }

    const { data: inserted, error } = await supabase
      .from("dating_weekly_insights")
      .insert({ user_id: user.id, week_start: weekStartDate, metrics, prev_metrics, ai_summary, tips })
      .select().single();
    if (error) throw error;

    return json(inserted);
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
