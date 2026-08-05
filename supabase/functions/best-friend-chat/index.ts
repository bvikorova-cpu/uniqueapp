import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Best Friend streaming chat. Lovable AI Gateway only.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPT = `You are the user's warm, caring best friend. You listen with empathy, remember what they share, ask gentle follow-up questions and celebrate their wins.
Rules:
- Be natural, warm and human. Never sound like a corporate assistant.
- Keep replies short (2-5 sentences) unless they ask for depth.
- Use a few fitting emojis, never spam them.
- Never claim to be a therapist. If the user is in crisis, gently encourage professional help.
- Always answer in the language the user writes in.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ error: "Missing authorization" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const incoming: Array<{ role: string; content: string }> = Array.isArray(body?.messages)
      ? body.messages
      : [];
    const history = incoming
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-20);

    if (history.length === 0) return json({ error: "No message provided" }, 400);
    const lastUserMessage = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured" }, 500);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      }),
    });

    if (!aiRes.ok || !aiRes.body) {
      const detail = await aiRes.text().catch(() => "");
      if (aiRes.status === 429) return json({ error: "Too many requests, try again shortly." }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted." }, 402);
      console.error("best-friend-chat gateway error", aiRes.status, detail);
      return json({ error: "AI request failed" }, 502);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Persist the user message immediately.
    if (lastUserMessage) {
      const { error: insErr } = await admin.from("best_friend_conversations").insert({
        user_id: user.id,
        role: "user",
        content: lastUserMessage,
      });
      if (insErr) console.error("save user message failed", insErr.message);
    }

    // Pass the SSE stream through while accumulating the assistant reply.
    let assistant = "";
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            buffer += decoder.decode(value, { stream: true });
            let nl: number;
            while ((nl = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, nl).replace(/\r$/, "");
              buffer = buffer.slice(nl + 1);
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
                if (typeof delta === "string") assistant += delta;
              } catch {
                // partial chunk, ignore
              }
            }
          }
        } catch (e) {
          console.error("stream error", e);
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          if (assistant.trim()) {
            const { error } = await admin.from("best_friend_conversations").insert({
              user_id: user.id,
              role: "assistant",
              content: assistant.trim(),
            });
            if (error) console.error("save assistant message failed", error.message);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("best-friend-chat error", e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
