// best-friend-chat: streaming OpenAI chat for the Best Friend hub.
// - Persists user + assistant messages into best_friend_conversations
// - Enforces 5 free messages for unsubscribed users
// - Decrements bonus_messages first, then monthly_messages_used (cap 1000)
//   for subscribed users
// - Returns SSE stream from OpenAI (gpt-4o)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT = 5;
const MONTHLY_LIMIT = 1000;

const SYSTEM_PROMPT = `You are the user's caring AI Best Friend. Be warm, empathetic, supportive, playful but never dismissive. Listen first, validate feelings, gently encourage. Keep replies concise (2-4 short paragraphs max), use light emoji sparingly, never give medical / legal / financial advice — instead suggest talking to a professional. Always reply in the language the user wrote in.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: userData, error: userErr } = await anon.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages required" }, 400);
    }
    const lastUserMsg = [...messages].reverse().find((m: any) => m?.role === "user");
    if (!lastUserMsg || typeof lastUserMsg.content !== "string") {
      return json({ error: "no user message" }, 400);
    }

    // ─── Load / lazy-create subscription/usage row ───
    let { data: sub } = await admin
      .from("best_friend_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!sub) {
      const { data: created } = await admin
        .from("best_friend_subscriptions")
        .insert({ user_id: user.id, subscription_status: "free", free_messages_used: 0, monthly_messages_used: 0, bonus_messages: 0 })
        .select("*")
        .single();
      sub = created;
    }

    const isSubscribed = sub?.subscription_status === "active";

    // ─── Quota check ───
    if (!isSubscribed) {
      const used = sub?.free_messages_used ?? 0;
      const bonus = sub?.bonus_messages ?? 0;
      if (used >= FREE_LIMIT && bonus <= 0) {
        return json({ error: "free_limit_reached", requiresSubscription: true }, 402);
      }
    } else {
      // Reset monthly counter if reset_at < now
      const resetAt = sub?.monthly_messages_reset_at ? new Date(sub.monthly_messages_reset_at) : null;
      if (!resetAt || resetAt.getTime() < Date.now()) {
        const next = new Date(); next.setMonth(next.getMonth() + 1);
        await admin
          .from("best_friend_subscriptions")
          .update({ monthly_messages_used: 0, monthly_messages_reset_at: next.toISOString() })
          .eq("user_id", user.id);
        sub = { ...sub, monthly_messages_used: 0 } as any;
      }
      const monthly = sub?.monthly_messages_used ?? 0;
      const bonus = sub?.bonus_messages ?? 0;
      if (monthly >= MONTHLY_LIMIT && bonus <= 0) {
        return json({ error: "monthly_limit_reached" }, 402);
      }
    }

    // ─── Persist user message ───
    const userMsg = String(lastUserMsg.content).slice(0, 4000);
    await admin.from("best_friend_conversations").insert({
      user_id: user.id, role: "user", content: userMsg,
    });

    // ─── Call OpenAI with streaming ───
    const safeHistory = (messages as any[])
      .slice(-20)
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 4000) }));

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeHistory],
      }),
    });

    if (!aiResp.ok || !aiResp.body) {
      const txt = await aiResp.text().catch(() => "");
      console.error("OpenAI error:", aiResp.status, txt);
      return json({ error: "AI service error" }, 502);
    }

    // Tee the stream: forward to client AND collect content for DB persistence + usage update
    const decoder = new TextDecoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResp.body!.getReader();
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            buf += decoder.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) !== -1) {
              let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const json = line.slice(6).trim();
              if (json === "[DONE]") break;
              try {
                const c = JSON.parse(json).choices?.[0]?.delta?.content;
                if (c) assistantContent += c;
              } catch { /* partial */ }
            }
          }
        } catch (e) {
          console.error("stream tee error", e);
        } finally {
          controller.close();
          // Persist assistant reply + decrement quota
          try {
            if (assistantContent.trim()) {
              await admin.from("best_friend_conversations").insert({
                user_id: user.id, role: "assistant", content: assistantContent,
              });
            }
            const updates: Record<string, unknown> = {};
            const bonus = sub?.bonus_messages ?? 0;
            if (bonus > 0) {
              updates.bonus_messages = bonus - 1;
            } else if (isSubscribed) {
              updates.monthly_messages_used = (sub?.monthly_messages_used ?? 0) + 1;
            } else {
              updates.free_messages_used = (sub?.free_messages_used ?? 0) + 1;
            }
            await admin.from("best_friend_subscriptions").update(updates).eq("user_id", user.id);
          } catch (e) {
            console.error("post-stream persist failed", e);
          }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("best-friend-chat error", msg);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
