import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT =
  "You are a warm, calm mindfulness and wellness coach. Keep replies short (2-4 sentences), practical and encouraging. Suggest breathing, grounding, journaling or reframing techniques. You are not a doctor: never diagnose, and if someone is in crisis gently point them to local emergency services or a helpline.";

const MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...incoming
        .filter((m: any) => m && typeof m.content === "string" && m.content.trim())
        .slice(-20)
        .map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content).slice(0, 4000),
        })),
    ];

    if (messages.length === 1) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retry transient 429/5xx with backoff, then fall back to a lighter model.
    let lastStatus = 0;
    for (let attempt = 0; attempt < 4; attempt++) {
      const model = MODELS[attempt >= 2 ? 1 : 0];
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true }),
      });

      if (res.ok && res.body) {
        return new Response(res.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      lastStatus = res.status;
      const text = await res.text().catch(() => "");
      console.error("AI gateway error:", res.status, model, text);

      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please top up." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status !== 429 && res.status < 500) break;
      if (attempt < 3) await sleep(600 * Math.pow(2, attempt));
    }

    return new Response(
      JSON.stringify({
        error:
          lastStatus === 429
            ? "AI is busy right now — please try again in a few seconds."
            : "AI request failed. Please try again.",
      }),
      { status: lastStatus === 429 ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("wellness-mindfulness-chat error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
