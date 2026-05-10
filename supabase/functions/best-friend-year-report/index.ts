// Generates a year-in-review JSON for the user (top moments, mood, stats).
// Frontend renders it as printable HTML / PDF.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Unauthorized" }, 401);
    const OPENAI = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI) return j({ error: "no key" }, 500);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: u } = await anon.auth.getUser();
    if (!u.user) return j({ error: "Unauthorized" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });

    const yearAgo = new Date(); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const [{ data: msgs }, { data: progress }, { data: mems }, { data: persona }] = await Promise.all([
      admin.from("best_friend_conversations").select("content,role,created_at")
        .eq("user_id", u.user.id).gte("created_at", yearAgo.toISOString())
        .order("created_at", { ascending: true }).limit(500),
      admin.from("best_friend_progress").select("*").eq("user_id", u.user.id).maybeSingle(),
      admin.from("best_friend_memories").select("category,content,importance")
        .eq("user_id", u.user.id).order("importance",{ascending:false}).limit(15),
      admin.from("best_friend_persona").select("friend_name,language").eq("user_id", u.user.id).maybeSingle(),
    ]);

    const userMsgs = (msgs || []).filter((m: any) => m.role === "user").map((m: any) => m.content).slice(0, 80);
    const lang = persona?.language || "en";

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `You write a heartwarming year-in-review for an AI best-friend chat. Output JSON: {"headline":"<title>","top_moments":["..","..","..","..","..","..","..","..","..",".."],"growth_areas":["...","..."],"mood_summary":"...","letter_to_friend":"<3-5 sentence personal letter from ${persona?.friend_name||"Bestie"} to the user>"}. Reply in language code "${lang}".` },
          { role: "user", content: `User had ${progress?.total_messages||0} messages, current streak ${progress?.current_streak||0} days, level ${progress?.level||1}. Memorable facts:\n${(mems||[]).map((m:any)=>`- ${m.content}`).join("\n")}\n\nRecent user messages:\n${userMsgs.join("\n").slice(0,4000)}` },
        ],
      }),
    });
    if (!ai.ok) return j({ error: "ai" }, 502);
    const data = await ai.json();
    let parsed: any = {};
    try { parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}"); } catch {}

    return j({
      ...parsed,
      stats: {
        total_messages: progress?.total_messages || 0,
        level: progress?.level || 1,
        xp: progress?.xp || 0,
        longest_streak: progress?.longest_streak || 0,
        current_streak: progress?.current_streak || 0,
        memories_count: (mems || []).length,
      },
    });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
