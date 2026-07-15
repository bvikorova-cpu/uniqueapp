// Uni — Unique's voice assistant. Understands short user commands,
// deducts 5 credits, returns a spoken reply + optional navigation action.
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const COST = 5;

const SYSTEM_PROMPT = `You are "Uni", the voice assistant of the Unique platform (uniqueapp.fun).
You are warm, brief and helpful. Reply in the same language the user spoke.
Keep replies under 2 short sentences — they will be read aloud.

You can navigate the user to these routes when it matches their intent:
- "/" home
- "/ai-mentor/hub" Personal AI Mentor coaches
- "/megatalent" Megatalent contest
- "/dating" Dating
- "/bazaar" Bazaar marketplace
- "/skills" Skills marketplace (P2P microservices)
- "/education" Education / courses
- "/kids" Kids channel
- "/health" Health & Wellness
- "/jobs" Jobs
- "/wallet" Credits & wallet
- "/notifications" Notifications
- "/report-bug" Report a bug (beta rewards)
- "/settings" Settings

When the user clearly asks to open, go to, or show one of these, call the navigate tool.
Otherwise just answer briefly. Never invent routes not listed above.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return json({ error: "auth_required" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const transcript = String(body?.transcript ?? "").trim().slice(0, 1000);
    const currentRoute = String(body?.currentRoute ?? "/").slice(0, 200);
    if (!transcript) return json({ error: "empty_transcript" }, 400);

    // Deduct 5 credits (service role bypasses RLS on RPC)
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE);
    const { data: ok, error: creditErr } = await svc.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "Uni voice assistant",
      p_source: "uni-assistant",
    });
    if (creditErr) return json({ error: creditErr.message }, 500);
    if (ok === false) return json({ error: "INSUFFICIENT_CREDITS" }, 402);

    // Call Lovable AI Gateway with tool calling
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `The user is currently on route: ${currentRoute}` },
          { role: "user", content: transcript },
        ],
        tools: [{
          type: "function",
          function: {
            name: "navigate",
            description: "Navigate the app to a route from the allowed list.",
            parameters: {
              type: "object",
              properties: {
                path: { type: "string", description: "Route path starting with /" },
              },
              required: ["path"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: "auto",
      }),
    });

    if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (aiRes.status === 402) return json({ error: "ai_credits_exhausted" }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: `ai_error: ${aiRes.status} ${t.slice(0, 200)}` }, 500);
    }

    const data = await aiRes.json();
    const msg = data?.choices?.[0]?.message ?? {};
    const toolCall = msg.tool_calls?.[0];
    let action: { type: "navigate"; path: string } | null = null;
    if (toolCall?.function?.name === "navigate") {
      try {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        if (typeof args.path === "string" && args.path.startsWith("/")) {
          action = { type: "navigate", path: args.path };
        }
      } catch { /* ignore */ }
    }
    const reply = String(msg.content ?? "").trim()
      || (action ? `Opening ${action.path} for you.` : "Okay.");

    return json({ reply, action, creditsSpent: COST });
  } catch (e) {
    console.error("uni-assistant error", e);
    return json({ error: (e as Error).message ?? "unknown" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
