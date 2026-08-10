import "../_shared/aiRedirect.ts";
// AI-powered chat with personality clones via OpenAI (gpt-4o).
// Enforces 20 AI responses/day per user limit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, OpenAIError } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const DAILY_LIMIT = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "No auth" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { cloneId, message, history, mode, sessionId, text, style } = body ?? {};

    // ---- Voice style mode: rewrite sample text without depending on a separate function ----
    if (mode === "voice") {
      if (typeof text !== "string" || !text.trim()) return j({ error: "text is required" }, 400);
      if (text.trim().length > 4000) return j({ error: "Text is too long (maximum 4,000 characters)" }, 400);

      const styleDescriptions: Record<string, string> = {
        warm: "warm, friendly, slightly casual, and empathetic",
        professional: "polished, precise, courteous, and business-appropriate",
        energetic: "upbeat, enthusiastic, motivational, and lively",
        calm: "calm, measured, soothing, and thoughtful",
        authoritative: "direct, confident, decisive, and leadership-focused",
      };
      const selectedStyle = typeof style === "string" && styleDescriptions[style]
        ? style
        : "warm";
      const sourceText = text.trim();
      let transformed = sourceText;

      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (apiKey) {
        try {
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "vercel-ai-sdk",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3.6-flash",
              messages: [
                {
                  role: "system",
                  content: `Rewrite the user's message in a ${styleDescriptions[selectedStyle]} voice. Preserve its meaning and language. Return only the rewritten message without labels, markdown, or explanation.`,
                },
                { role: "user", content: sourceText },
              ],
            }),
          });

          if (response.ok) {
            const payload = await response.json();
            const generated = payload?.choices?.[0]?.message?.content;
            if (typeof generated === "string" && generated.trim()) transformed = generated.trim();
          } else {
            console.error("Voice transform gateway error", response.status, await response.text());
          }
        } catch (error) {
          console.error("Voice transform request failed", error);
        }
      }

      return j({ transformed, style: selectedStyle });
    }

    // ---- Speed dating mode: run an AI date between two clones ----
    if (mode === "date") {
      if (!sessionId || typeof sessionId !== "string") return j({ error: "sessionId is required" }, 400);

      const { data: session } = await admin
        .from("clone_dating_sessions")
        .select("id, clone_1_id, clone_2_id, status, session_data, compatibility_score")
        .eq("id", sessionId).maybeSingle();
      if (!session) return j({ error: "Session not found" }, 404);

      const { data: clones } = await admin
        .from("personality_clones")
        .select("id, user_id, clone_name, personality_data")
        .in("id", [session.clone_1_id, session.clone_2_id]);
      if (!(clones ?? []).some((c: any) => c.user_id === user.id)) return j({ error: "Forbidden" }, 403);

      const existing = (session.session_data ?? {}) as Record<string, unknown>;


      const a = (clones ?? []).find((c: any) => c.id === session.clone_1_id);
      const b = (clones ?? []).find((c: any) => c.id === session.clone_2_id);
      let nameA = (a?.clone_name ?? "Clone A").trim();
      let nameB = (b?.clone_name ?? "Clone B").trim();
      // Two clones can share the same name (or be the same clone) — keep speakers distinguishable.
      if (nameA.toLowerCase() === nameB.toLowerCase()) {
        nameA = `${nameA} (you)`;
        nameB = `${nameB} (match)`;
      }

      // Reuse a cached transcript only if it already has two distinct speakers;
      // older sessions were saved with one repeated label, so regenerate those.
      if (session.status === "completed" && Array.isArray(existing.messages) && existing.messages.length) {
        const cached = existing.messages as { speaker?: string; text?: string }[];
        const distinct = new Set(cached.map((m) => (m.speaker ?? "").toLowerCase()));
        if (distinct.size >= 2) {
          return j({ ok: true, messages: cached, summary: existing.summary, score: session.compatibility_score });
        }
        // repair labels in place without a new AI call
        const repaired = cached.map((m, i) => ({ speaker: i % 2 === 0 ? nameA : nameB, text: String(m.text ?? "") }));
        await admin.from("clone_dating_sessions")
          .update({ session_data: { ...existing, messages: repaired } })
          .eq("id", sessionId);
        return j({ ok: true, messages: repaired, summary: existing.summary, score: session.compatibility_score });
      }


      let dateMessages: { speaker: string; text: string }[] = [];
      let summary = "";
      let score = 60 + Math.floor(Math.random() * 35);

      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (apiKey) {
        const prompt = `Write a short speed-dating conversation between two AI personality clones.
Clone A: ${nameA}. Personality: ${JSON.stringify(a?.personality_data ?? { personality: "friendly, curious" })}.
Clone B: ${nameB}. Personality: ${JSON.stringify(b?.personality_data ?? { personality: "warm, playful" })}.
They are two DIFFERENT people. Messages must strictly alternate, starting with ${nameA}.
Return STRICT JSON only, no markdown:
{"messages":[{"speaker":"${nameA}","text":"..."},{"speaker":"${nameB}","text":"..."}],"summary":"2-3 sentences about the chemistry","score":0-100}
Use 8 alternating messages, each max 200 characters, in English.`;
        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "vercel-ai-sdk",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ model: "google/gemini-3.6-flash", messages: [{ role: "user", content: prompt }] }),
          });
          if (res.ok) {
            const payload = await res.json();
            const cleaned = String(payload?.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
            try {
              const parsed = JSON.parse(cleaned);
              if (Array.isArray(parsed.messages)) {
                // Force strict alternation so both sides never carry the same label.
                dateMessages = parsed.messages.slice(0, 20).map((m: any, i: number) => ({
                  speaker: i % 2 === 0 ? nameA : nameB,
                  text: String(m?.text ?? ""),
                })).filter((m: any) => m.text);
              }
              if (typeof parsed.summary === "string") summary = parsed.summary;
              if (typeof parsed.score === "number") score = Math.max(0, Math.min(100, Math.round(parsed.score)));
            } catch { summary = cleaned.slice(0, 800); }
          }
        } catch (_) { /* fall back below */ }
      }

      if (!dateMessages.length) {
        dateMessages = [
          { speaker: nameA, text: "Hi! We only have ten minutes — what's the most interesting thing about you?" },
          { speaker: nameB, text: "I collect strange facts. Did you know octopuses have three hearts?" },
          { speaker: nameA, text: "Then we have something in common: I love things that break the rules." },
          { speaker: nameB, text: "Rule-breakers make the best conversations. What keeps you up at night?" },
          { speaker: nameA, text: "Ideas I haven't finished yet. And you?" },
          { speaker: nameB, text: "Songs I can't stop humming. I think we'd get along." },
        ];
        if (!summary) summary = "Easy rhythm and shared curiosity — a promising first match.";
      }

      await admin.from("clone_dating_sessions").update({
        status: "completed",
        compatibility_score: score,
        completed_at: new Date().toISOString(),
        session_data: { ...existing, messages: dateMessages, summary },
      }).eq("id", sessionId);

      return j({ ok: true, messages: dateMessages, summary, score });
    }

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

    // First-ever message from this user to this clone => new conversation
    const { count: priorMessages } = await admin
      .from("clone_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("clone_id", cloneId)
      .eq("user_id", user.id);

    await admin.from("clone_chat_messages").insert([
      { clone_id: cloneId, user_id: user.id, role: "user", content: message },
      { clone_id: cloneId, user_id: user.id, role: "assistant", content: reply },
    ]);

    if (!priorMessages) {
      await admin.rpc("increment_clone_conversations", { p_clone_id: cloneId });
    }

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
