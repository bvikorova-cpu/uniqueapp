// AI-powered chat with personality clones via Lovable AI Gateway.
// Enforces 20 AI responses/day per user limit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    // Daily rate limit
    const today = new Date().toISOString().slice(0, 10);
    const { data: limit } = await admin
      .from("clone_chat_daily_limits")
      .select("id, responses_used")
      .eq("user_id", user.id).eq("date", today).maybeSingle();
    const used = limit?.responses_used ?? 0;
    if (used >= DAILY_LIMIT) {
      return j({ error: `Daily limit reached (${DAILY_LIMIT} AI responses/day). Try tomorrow.` }, 429);
    }

    // Fetch clone (RLS-bypassed via service role for marketplace access)
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
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })) : []),
      { role: "user", content: message },
    ];

    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) return j({ error: "AI gateway not configured" }, 500);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
    });
    if (aiRes.status === 429) return j({ error: "Rate limit exceeded, please try again later." }, 429);
    if (aiRes.status === 402) return j({ error: "AI credits exhausted. Please top up." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      return j({ error: "AI gateway error" }, 500);
    }
    const aiData = await aiRes.json();
    const reply = aiData.choices?.[0]?.message?.content?.trim() || "...";

    // Save messages + bump counter
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
