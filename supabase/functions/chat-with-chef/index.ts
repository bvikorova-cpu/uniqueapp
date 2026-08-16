import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const COST = 3;

const SYSTEM = `You are an experienced professional chef and friendly cooking mentor.
Answer practically and concretely: techniques, timings, temperatures, substitutions and troubleshooting.
Keep answers focused (max ~250 words) and use short paragraphs or bullet lists. Never use tables.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const message = String(body?.message ?? "").slice(0, 2000);
    if (!message.trim()) return errorResponse("Message is required", 400);
    const sessionId = typeof body?.session_id === "string" && body.session_id
      ? body.session_id
      : crypto.randomUUID();
    const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("AI is not configured", 500);

    const messages = [
      { role: "system", content: SYSTEM },
      ...history
        .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
      { role: "user", content: message },
    ];

    let reply = "";
    let lastError = "";
    for (const model of ["google/gemini-3.5-flash", "google/gemini-3.1-flash-lite"]) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
          body: JSON.stringify({ model, messages, max_tokens: 1200 }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data?.choices?.[0]?.message?.content ?? "";
          break;
        }
        lastError = await res.text();
        if (res.status === 402) return jsonResponse({ error: "AI credits exhausted" }, 402);
        if (res.status !== 429 && res.status < 500) break;
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      }
      if (reply) break;
    }

    if (!reply) {
      console.error("[chat-with-chef] AI failed", lastError);
      return errorResponse("The chef is busy right now. No credits were charged — please try again in a moment.", 503);
    }

    const creditDenied = await deductAICredits(user.id, COST, "chat-with-chef");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, reply, session_id: sessionId });
  } catch (e: any) {
    console.error("[chat-with-chef] error", e);
    return errorResponse(e?.message || "Function failed");
  }
});
