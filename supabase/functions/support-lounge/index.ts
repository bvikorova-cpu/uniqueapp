import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callUnifiedAI } from "../_shared/unifiedAI.ts";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENTRY_CREDITS = 1;
const AI_MESSAGE_CREDITS = 3;

const AI_SYSTEM_PROMPT = `You are a warm, empathetic support companion inside "Broken Hearts — You Are Not Alone" on the Unique platform — a safe space for people who were cheated on, disappointed, left behind, or are going through heartbreak and loneliness.

Your role:
- Listen without judging. Validate feelings first, advise second.
- Be gentle, warm, and encouraging. Never dismiss or minimize pain.
- Help the user process emotions, see their own worth, and take small healthy steps forward.
- Use simple, kind language. Short paragraphs. Occasional soft emoji (💛🌱) are fine.
- Never blame the user. Never encourage revenge, self-harm, or contact with an abusive ex.

Safety rules (critical):
- You are NOT a therapist, doctor, or crisis service. If the user mentions self-harm, suicide, or being in danger, respond with compassion and clearly urge them to contact local emergency services or a crisis hotline, and to talk to someone they trust. Do not try to handle a crisis yourself.
- Do not give medical, legal, or financial advice.
- Keep the conversation supportive and safe at all times.

Format: plain text with light markdown. Keep replies concise (under 180 words) unless the user asks for more.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authErr } = await authClient.auth.getUser(token);
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { action, ...body } = await req.json();
    const today = new Date().toISOString().slice(0, 10);

    const getPass = async () => {
      const { data } = await admin
        .from("support_lounge_passes")
        .select("id")
        .eq("user_id", user.id)
        .eq("pass_date", today)
        .maybeSingle();
      return data;
    };

    if (action === "enter") {
      let pass = await getPass();
      let charged = false;
      let remaining: number | null = null;

      if (!pass) {
        const spend = await spendAiCredits(
          admin,
          user.id,
          ENTRY_CREDITS,
          "Broken Hearts daily entry",
          "support_lounge",
        );
        if (!spend.ok) {
          return json({ error: "insufficient_credits", required: ENTRY_CREDITS, remaining: spend.remaining }, 402);
        }
        remaining = spend.remaining;
        const { error: passErr } = await admin
          .from("support_lounge_passes")
          .insert({ user_id: user.id, pass_date: today, credits_charged: ENTRY_CREDITS });
        if (passErr && !String(passErr.message).includes("duplicate")) {
          return json({ error: "Failed to create pass" }, 500);
        }
        charged = true;
        pass = await getPass();
      }

      const { data: nick } = await admin
        .from("support_lounge_nicknames")
        .select("nickname")
        .eq("user_id", user.id)
        .maybeSingle();

      return json({ ok: true, charged, remaining, nickname: nick?.nickname ?? null });
    }

    if (action === "set_nickname") {
      const raw = typeof body.nickname === "string" ? body.nickname.trim() : "";
      if (raw.length < 2 || raw.length > 24) {
        return json({ error: "Nickname must be 2–24 characters." }, 400);
      }
      if (!/^[\p{L}\p{N} _.-]+$/u.test(raw)) {
        return json({ error: "Nickname contains unsupported characters." }, 400);
      }
      const { error } = await admin
        .from("support_lounge_nicknames")
        .upsert({ user_id: user.id, nickname: raw });
      if (error) return json({ error: "Could not save nickname." }, 500);
      return json({ ok: true, nickname: raw });
    }

    if (action === "ai") {
      const pass = await getPass();
      if (!pass) return json({ error: "no_pass" }, 403);

      const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
      if (messages.length === 0) return json({ error: "messages required" }, 400);

      const { data: spend, error: spendError } = await admin.rpc("spend_ai_credits_for_user", {
        p_user_id: user.id,
        p_amount: AI_MESSAGE_CREDITS,
        p_reason: "Broken Hearts AI Companion reply",
        p_source: "support_lounge_ai",
      });
      if (spendError) {
        console.error("support-lounge AI credit deduction failed:", spendError.message);
        return json({ error: "credit_charge_failed" }, 500);
      }
      if (!spend?.ok) {
        return json({
          error: "insufficient_credits",
          required: AI_MESSAGE_CREDITS,
          remaining: spend?.balance ?? 0,
        }, 402);
      }

      let reply: string;
      try {
        reply = await callUnifiedAI(
          [
            { role: "system", content: AI_SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: String(m.content ?? "").slice(0, 2000),
            })),
          ],
          { max_tokens: 700 },
        );
      } catch (aiError) {
        const { error: refundError } = await admin.rpc("add_ai_credits", {
          p_user_id: user.id,
          p_amount: AI_MESSAGE_CREDITS,
          p_reason: "Broken Hearts AI Companion refund",
          p_source: "support_lounge_ai_refund",
        });
        if (refundError) console.error("support-lounge AI refund failed:", refundError.message);
        throw aiError;
      }

      return json({ reply, credits_used: AI_MESSAGE_CREDITS, remaining: spend.balance });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("support-lounge error:", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
