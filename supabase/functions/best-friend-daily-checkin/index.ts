// Cron-invoked: scans best_friend_check_ins, sends a proactive AI message
// to all users whose preferred local hour matches now AND last_sent < today.
// Inserts assistant message into best_friend_conversations so it appears next time
// the user opens the chat.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const OPENAI = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI) return j({ error: "no key" }, 500);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });

    const { data: rows } = await admin.from("best_friend_check_ins")
      .select("user_id,preferred_hour,timezone,last_sent_at").eq("enabled", true);
    if (!rows || rows.length === 0) return j({ sent: 0 });

    const nowIso = new Date().toISOString();
    let sent = 0;
    for (const row of rows) {
      try {
        // Compute local hour for user
        const localHour = Number(new Intl.DateTimeFormat("en-US", {
          hour: "numeric", hour12: false, timeZone: row.timezone || "UTC",
        }).format(new Date()));
        if (localHour !== row.preferred_hour) continue;
        // Skip if already sent in last 20h
        if (row.last_sent_at && Date.now() - new Date(row.last_sent_at).getTime() < 20 * 3600 * 1000) continue;

        const { data: persona } = await admin.from("best_friend_persona")
          .select("friend_name,language,user_nickname").eq("user_id", row.user_id).maybeSingle();
        const { data: mems } = await admin.from("best_friend_memories")
          .select("content").eq("user_id", row.user_id).order("importance",{ascending:false}).limit(8);

        const memText = (mems || []).map((m: any) => `- ${m.content}`).join("\n");
        const ai = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 120,
            messages: [
              { role: "system", content: `You are ${persona?.friend_name || "Bestie"}, the user's AI best friend. Write a warm, short (1-2 sentences) proactive check-in message. Reply in language code "${persona?.language || "en"}". Mention something specific from these memories if natural:\n${memText}` },
              { role: "user", content: persona?.user_nickname ? `Send a daily check-in to ${persona.user_nickname}.` : "Send a daily check-in." },
            ],
          }),
        });
        if (!ai.ok) continue;
        const data = await ai.json();
        const msg = data.choices?.[0]?.message?.content;
        if (!msg) continue;

        await admin.from("best_friend_conversations").insert({
          user_id: row.user_id, role: "assistant", content: msg,
        });
        await admin.from("best_friend_check_ins").update({ last_sent_at: nowIso }).eq("user_id", row.user_id);
        sent++;
      } catch (e) {
        console.error("checkin err for user", row.user_id, e);
      }
    }
    return j({ sent });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
