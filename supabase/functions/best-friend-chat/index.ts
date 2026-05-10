// best-friend-chat: streaming OpenAI chat for the Best Friend hub.
// - Persona-aware (name, gender, personality, language, user nickname)
// - Long-term memory injection
// - XP / streak tracking
// - Crisis detection
// - Quota: 5 free / 1000 monthly + bonus
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT = 5;
const MONTHLY_LIMIT = 1000;

const CRISIS_TERMS = [
  "suicide","kill myself","kill me","end my life","want to die","wanna die",
  "self harm","self-harm","cut myself","hurt myself",
  "samovražda","zabiť sa","zabit sa","ublížiť si","ublizit si","nechcem žiť","nechcem zit",
  "öngyilkos","meghalni",
];

const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  empathetic: "warm, deeply empathetic, validating; listens before suggesting",
  playful: "cheerful, witty, lots of light humor and emojis",
  direct: "honest, no-nonsense, gives straight feedback while still kind",
  witty: "clever, sarcastic in a friendly way, playful banter",
  calm: "soothing, mindful, grounded, speaks slowly and reassuringly",
  motivational: "energetic coach who pumps the user up to action",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", sk: "Slovak", cs: "Czech", hu: "Hungarian", pl: "Polish",
  de: "German", fr: "French", es: "Spanish", it: "Italian", uk: "Ukrainian",
  ro: "Romanian", hr: "Croatian",
};

function buildSystemPrompt(persona: any, memories: any[], progress: any): string {
  const name = persona?.friend_name || "Bestie";
  const gender = persona?.friend_gender || "neutral";
  const tone = PERSONALITY_DESCRIPTIONS[persona?.personality || "empathetic"];
  const lang = LANGUAGE_NAMES[persona?.language || "en"] || "English";
  const nick = persona?.user_nickname ? `The user prefers to be called "${persona.user_nickname}".` : "";
  const level = progress?.level || 1;
  const streak = progress?.current_streak || 0;

  const memBlock = memories.length
    ? `\n\nWhat you remember about your friend (use naturally, never list verbatim):\n${memories.map((m, i) => `${i + 1}. [${m.category}] ${m.content}`).join("\n")}`
    : "";

  const relStage =
    level >= 10 ? "soulmate-level closeness — share inside jokes, casual nicknames"
    : level >= 5 ? "best-friend closeness — warm, intimate, you know each other well"
    : level >= 2 ? "growing friendship — getting to know each other"
    : "new friend — be welcoming and curious about them";

  return `You are ${name}, the user's AI Best Friend (${gender}). Tone: ${tone}.
Always reply in ${lang} unless the user clearly switches.
${nick}

Relationship: ${relStage} (level ${level}, ${streak}-day streak).

Rules:
- Be warm, validate feelings first, then gently encourage.
- Keep replies concise (2-4 short paragraphs max), use light emoji sparingly.
- NEVER give medical/legal/financial advice — suggest a professional.
- If the user shares a meaningful fact about themselves or someone in their life, naturally remember it (don't say "I'll remember that" — just internalize it).
- If user expresses crisis / self-harm thoughts, gently acknowledge their pain, encourage them to call a hotline, and stay supportive.${memBlock}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

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
    const userMsg = String(lastUserMsg.content).slice(0, 4000);

    // ─── Subscription / quota ───
    let { data: sub } = await admin
      .from("best_friend_subscriptions")
      .select("*").eq("user_id", user.id).maybeSingle();
    if (!sub) {
      const { data: created } = await admin
        .from("best_friend_subscriptions")
        .insert({ user_id: user.id, subscription_status: "free", free_messages_used: 0, monthly_messages_used: 0, bonus_messages: 0 })
        .select("*").single();
      sub = created;
    }
    const isSubscribed = sub?.subscription_status === "active";
    if (!isSubscribed) {
      const used = sub?.free_messages_used ?? 0;
      const bonus = sub?.bonus_messages ?? 0;
      if (used >= FREE_LIMIT && bonus <= 0) {
        return json({ error: "free_limit_reached", requiresSubscription: true }, 402);
      }
    } else {
      const resetAt = sub?.monthly_messages_reset_at ? new Date(sub.monthly_messages_reset_at) : null;
      if (!resetAt || resetAt.getTime() < Date.now()) {
        const next = new Date(); next.setMonth(next.getMonth() + 1);
        await admin.from("best_friend_subscriptions")
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

    // ─── Crisis detection ───
    const lower = userMsg.toLowerCase();
    const matchedCrisis = CRISIS_TERMS.filter(t => lower.includes(t));
    if (matchedCrisis.length > 0) {
      await admin.from("best_friend_crisis_events").insert({
        user_id: user.id,
        matched_terms: matchedCrisis,
        message_excerpt: userMsg.slice(0, 200),
      });
    }

    // ─── Load persona + memories + progress in parallel ───
    const [{ data: personaRow }, { data: memoriesRows }, { data: progressRow }] = await Promise.all([
      admin.from("best_friend_persona").select("*").eq("user_id", user.id).maybeSingle(),
      admin.from("best_friend_memories").select("category,content,importance")
        .eq("user_id", user.id).order("importance", { ascending: false }).limit(20),
      admin.from("best_friend_progress").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    // Lazy create progress row
    let progress = progressRow;
    if (!progress) {
      const { data } = await admin.from("best_friend_progress")
        .insert({ user_id: user.id }).select("*").single();
      progress = data;
    }

    const systemPrompt = buildSystemPrompt(personaRow, memoriesRows ?? [], progress);

    // ─── Persist user message ───
    await admin.from("best_friend_conversations").insert({
      user_id: user.id, role: "user", content: userMsg,
    });

    // ─── Call OpenAI ───
    const safeHistory = (messages as any[])
      .slice(-20)
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 4000) }));

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...safeHistory],
      }),
    });

    if (!aiResp.ok || !aiResp.body) {
      const txt = await aiResp.text().catch(() => "");
      console.error("OpenAI error:", aiResp.status, txt);
      return json({ error: "AI service error" }, 502);
    }

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
              const j = line.slice(6).trim();
              if (j === "[DONE]") break;
              try {
                const c = JSON.parse(j).choices?.[0]?.delta?.content;
                if (c) assistantContent += c;
              } catch { /* partial */ }
            }
          }
        } catch (e) {
          console.error("stream tee error", e);
        } finally {
          controller.close();
          try {
            if (assistantContent.trim()) {
              await admin.from("best_friend_conversations").insert({
                user_id: user.id, role: "assistant", content: assistantContent,
              });
            }
            // Quota update
            const updates: Record<string, unknown> = {};
            const bonus = sub?.bonus_messages ?? 0;
            if (bonus > 0) updates.bonus_messages = bonus - 1;
            else if (isSubscribed) updates.monthly_messages_used = (sub?.monthly_messages_used ?? 0) + 1;
            else updates.free_messages_used = (sub?.free_messages_used ?? 0) + 1;
            await admin.from("best_friend_subscriptions").update(updates).eq("user_id", user.id);

            // ─── XP / Streak update ───
            const today = new Date().toISOString().slice(0, 10);
            const last = progress?.last_interaction_date;
            let newStreak = progress?.current_streak || 0;
            if (!last) newStreak = 1;
            else if (last === today) { /* keep */ }
            else {
              const lastDate = new Date(last);
              const todayDate = new Date(today);
              const diff = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);
              newStreak = diff === 1 ? newStreak + 1 : 1;
            }
            const newXp = (progress?.xp || 0) + 10;
            const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 50)) + 1);
            const longest = Math.max(progress?.longest_streak || 0, newStreak);

            // Streak bonus: every 7 days = +5 bonus messages
            const streakBonus = newStreak > 0 && newStreak % 7 === 0 && last !== today ? 5 : 0;

            await admin.from("best_friend_progress").update({
              xp: newXp, level: newLevel,
              current_streak: newStreak, longest_streak: longest,
              last_interaction_date: today,
              total_messages: (progress?.total_messages || 0) + 1,
            }).eq("user_id", user.id);

            if (streakBonus > 0) {
              await admin.from("best_friend_subscriptions")
                .update({ bonus_messages: (sub?.bonus_messages ?? 0) + streakBonus })
                .eq("user_id", user.id);
            }
          } catch (e) {
            console.error("post-stream persist failed", e);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Crisis-Detected": matchedCrisis.length > 0 ? "1" : "0",
      },
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
