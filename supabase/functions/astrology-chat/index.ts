import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Self-contained Mystic Chat handler. Lovable AI Gateway only. Unified ai_credits ledger.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const COST = 1;

async function callGateway(system: string, user: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  let lastErr = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return text.trim();
      lastErr = "Empty AI response";
    } else {
      lastErr = `${res.status}: ${await res.text()}`;
      if (res.status === 402) throw new Error("PAYMENT_REQUIRED");
      if (res.status !== 429 && res.status < 500) break;
    }
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  throw new Error(lastErr || "AI request failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const { messages = [], message = "", sign } = body ?? {};

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: creditRow } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = creditRow?.credits_remaining ?? 0;
    if (remaining < COST) {
      return json({ error: "INSUFFICIENT_CREDITS", required: COST, remaining }, 402);
    }

    const recent = (Array.isArray(messages) ? messages.slice(-8) : [])
      .map((m: any) => `${m?.role}: ${m?.content}`)
      .join("\n");
    const userText = message || messages?.slice?.(-1)?.[0]?.content || "Tell me about my day";

    const reply = await callGateway(
      `You are a wise, warm astrologer and mystic guide. ${sign ? `The user's zodiac sign is ${sign}.` : ""} Reply in English, 2-5 sentences, insightful and mystical but practical.`,
      recent ? `${recent}\nuser: ${userText}` : userText,
    );

    // Deduct AFTER a successful AI call (atomic, race-safe)
    const { error: deductErr } = await admin.rpc("deduct_ai_credits_atomic", {
      _user_id: user.id,
      _amount: COST,
    });
    if (deductErr) {
      const msg = deductErr.message || "";
      return json({ error: msg }, msg.includes("INSUFFICIENT_CREDITS") ? 402 : 500);
    }

    return json({
      success: true,
      reply,
      message: reply,
      response: reply,
      cost: COST,
      credits_used: COST,
      remaining: Math.max(0, remaining - COST),
    });
  } catch (e: any) {
    const msg = e?.message || "Astrology chat failed";
    if (msg === "PAYMENT_REQUIRED") {
      return json({ error: "AI credits exhausted. Please add credits." }, 402);
    }
    return json({ error: msg }, 500);
  }
});
