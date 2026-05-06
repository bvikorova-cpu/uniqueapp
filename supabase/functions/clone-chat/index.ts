// AI-powered chat with personality clones via OpenAI (gpt-4o).
// Enforces 20 AI responses/day per user limit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, OpenAIError } from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_LIMIT = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "No auth" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const { cloneId, message, history } = await req.json();
    if (!cloneId || !message?.trim()) return j({ error: "cloneId and message required" }, 400);

    const today = new Date().toISOString().slice(0, 10);
    const { data: limit } = await admin
      .from("clone_chat_daily_limits")
      .select("id, responses_used")
      .eq("user_id", user.id).eq("date", today).maybeSingle();
    const used = limit?.responses_used ?? 0;
    if (used >= DAILY_LIMIT) {
      return j({ error: `Daily limit reached (${DAILY_LIMIT} AI responses/day). Try tomorrow.` }, 429);
    }

    const { data: clone } = await admin.from("personality_clones")
      .select("clone_name, personality_data, is_active").eq("id", cloneId).maybeSingle();
    if (!clone || !clone.is_active) return j({ error: "Clone not available" }, 404);

    const pd = clone.personality_data || {};
    const systemPrompt = `You are ${clone.clone_name}, an AI personality clone. Stay in character.
Personality: ${pd.personality || "warm, curious, thoughtful"}
Interests: ${pd.interests || "varied"}
Communication style: ${pd.communicationStyle || "natural"}
Tone: ${pd.tone || "friendly"}

Respond in 1-3 short sentences. Never mention being an AI.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })) : []),
      { role: "user" as const, content: message },
    ];

    let reply = "...";
    try {
      reply = (await callOpenAI({ messages, temperature: 0.8 })) || "...";
    } catch (e) {
      if (e instanceof OpenAIError) return j({ error: e.message }, e.status);
      throw e;
    }

    await admin.from("clone_chat_messages").insert([
      { clone_id: cloneId, user_id: user.id, role: "user", content: message },
      { clone_id: cloneId, user_id: user.id, role: "assistant", content: reply },
    ]);
    if (limit) {
      await admin.from("clone_chat_daily_limits").update({ responses_used: used + 1 }).eq("id", limit.id);
    } else {
      await admin.from("clone_chat_daily_limits").insert({ user_id: user.id, date: today, responses_used: 1 });
    }

    return j({ reply, remaining: DAILY_LIMIT - used - 1 });
  } catch (e: any) {
    console.error(e);
    return j({ error: e.message || "Unknown error" }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
