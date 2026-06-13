// Chats with a digital_offspring using its system_prompt, persists conversation rows.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const { offspringId, message } = body || {};
    if (!offspringId || !message) return json({ error: "offspringId and message required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: offspring } = await admin
      .from("digital_offspring")
      .select("*")
      .eq("id", offspringId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!offspring) return json({ error: "Offspring not found" }, 404);

    const { data: history } = await admin
      .from("digital_offspring_conversations")
      .select("role, message")
      .eq("offspring_id", offspringId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = [
      { role: "system", content: offspring.system_prompt ?? `You are ${offspring.name}, a digital offspring AI.` },
      ...(history ?? []).map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.message })),
      { role: "user", content: message },
    ];

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages }),
    });
    if (aiResp.status === 429) return json({ error: "Rate limited" }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!aiResp.ok) {
      console.error("AI error", aiResp.status, await aiResp.text());
      return json({ error: "AI request failed" }, 500);
    }
    const aiData = await aiResp.json();
    const reply = aiData.choices?.[0]?.message?.content ?? "...";

    // Persist both messages
    await admin.from("digital_offspring_conversations").insert([
      { offspring_id: offspringId, user_id: user.id, role: "user", message },
      { offspring_id: offspringId, user_id: user.id, role: "assistant", message: reply },
    ]);
    await admin
      .from("digital_offspring")
      .update({ last_interaction_at: new Date().toISOString() })
      .eq("id", offspringId);

    return json({ reply });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
