import "../_shared/aiRedirect.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AI Psychologist chat: credit-based (no subscription).
const MESSAGE_COST = 1;

const SYSTEM_PROMPT = `You are a warm, empathetic AI psychologist offering supportive, non-judgmental conversation.
- Listen actively, validate feelings, and ask gentle open questions.
- Offer practical coping tools (breathing, grounding, CBT reframing) when useful.
- Never diagnose or prescribe medication.
- If the user mentions self-harm, suicide or immediate danger, respond with care and urge them to contact local emergency services or a crisis hotline.
Keep answers concise, warm and human. Use light markdown.`;

const MODELS = ["google/gemini-3.6-flash", "google/gemini-2.0-flash-lite"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) return json({ error: "messages required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: creditsRow } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();
    const remaining = creditsRow?.credits_remaining ?? 0;
    if (remaining < MESSAGE_COST) {
      return json({ error: "Insufficient credits", required: MESSAGE_COST, remaining, requiresCredits: true }, 402);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI not configured" }, 500);

    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
        .filter((m: any) => m?.role === "user" || m?.role === "assistant")
        .slice(-20)
        .map((m: any) => ({ role: m.role, content: String(m.content ?? "") })),
    ];

    let upstream: Response | null = null;
    let lastStatus = 0;
    for (const model of MODELS) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({ model, messages: chatMessages, stream: true }),
      });
      if (res.ok && res.body) { upstream = res; break; }
      lastStatus = res.status;
      console.error("psychology-chat gateway error", model, res.status, await res.text().catch(() => ""));
      if (res.status === 402) return json({ error: "AI credits exhausted on the platform" }, 402);
    }

    if (!upstream) {
      return json({ error: lastStatus === 429 ? "Rate limit exceeded. Please try again in a moment." : "AI service temporarily unavailable" }, lastStatus === 429 ? 429 : 500);
    }

    // Deduct only once the AI stream is confirmed.
    const { error: deductErr } = await admin.rpc("deduct_ai_credits_atomic", {
      _user_id: userId,
      _amount: MESSAGE_COST,
    });
    if (deductErr) {
      const msg = deductErr.message || "";
      return json({ error: msg }, msg.includes("INSUFFICIENT_CREDITS") ? 402 : 500);
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Credits-Used": String(MESSAGE_COST),
      },
    });
  } catch (e: any) {
    console.error("psychology-chat error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
