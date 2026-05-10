// Pre-defined roleplay scenarios. User picks scenario_id, gets streaming AI response.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCENARIOS: Record<string, string> = {
  interview: "Roleplay as a friendly but realistic job interviewer. Ask one question at a time, give feedback after the user's answer, then move on. Adapt difficulty.",
  hard_talk: "Roleplay as a person the user needs to have a difficult conversation with (boss, partner, parent — pick from user's intro). Be realistic but not cruel. Help the user practice.",
  dating: "Roleplay as a potential date on a first date. Be warm, ask getting-to-know-you questions, react to user's flirting attempts honestly so they can practice.",
  presentation: "Roleplay as an audience asking tough Q&A after the user's presentation. One question at a time.",
  conflict: "Roleplay as someone the user is in conflict with. Stay in character but help them practice de-escalation.",
  small_talk: "Roleplay as a stranger at a coffee shop / party. Help user practice small-talk and confidence.",
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

    const { scenario_id, messages } = await req.json();
    const scen = SCENARIOS[scenario_id];
    if (!scen) return j({ error: "unknown scenario" }, 400);
    if (!Array.isArray(messages)) return j({ error: "messages required" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });
    const { data: persona } = await admin.from("best_friend_persona")
      .select("language").eq("user_id", u.user.id).maybeSingle();
    const lang = persona?.language || "en";

    const safe = (messages as any[]).slice(-20).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        stream: true,
        messages: [
          { role: "system", content: `${scen}\nReply in language code "${lang}". Stay in character. Keep replies short (2-4 sentences).` },
          ...safe,
        ],
      }),
    });
    if (!aiResp.ok || !aiResp.body) return j({ error: "ai" }, 502);
    return new Response(aiResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
