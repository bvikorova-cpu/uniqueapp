// Uni — Unique's voice assistant. Understands short user commands,
// deducts 5 credits, returns a spoken reply + optional navigation action.
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callOpenAI } from "../_shared/openai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const COST = 5;

const SYSTEM_PROMPT = `You are "Uni", the voice assistant of the Unique platform (uniqueapp.fun).
You are warm, knowledgeable and helpful — a general-purpose assistant like Siri or ChatGPT.
Reply in the same language the user spoke. Keep answers spoken-friendly:
- For simple questions or commands: 1–2 short sentences.
- For explanations, how-tos, facts, math, coding, cooking, travel, science, history, definitions,
  translations, recommendations, comparisons, etc.: up to ~5 concise sentences with the real answer.
Never refuse just because a topic is outside the app. Answer general-knowledge questions directly
using what you know. If you truly don't know or the info may be outdated (live prices, today's
weather, breaking news), say so briefly and suggest how the user can check.

You can ALSO navigate the user anywhere inside the app — not only main sections, but also
sub-sections, categories, tools and features. For every request a list of MATCHING DESTINATIONS
from the app catalog is provided to you. When the user asks to find, search, open, show or go to
anything on the platform, pick the best destination from that list and call the navigate tool with
its exact path. Never say you cannot search the platform; if the list has any plausible match,
navigate there and say in one sentence what you opened. Only if the list is empty, say the feature
does not seem to exist and suggest the closest section.
Never invent routes that are not in the provided list. For general knowledge questions, just answer.`;


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return json({ error: "auth_required" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const transcript = String(body?.transcript ?? "").trim().slice(0, 1000);
    const currentRoute = String(body?.currentRoute ?? "/").slice(0, 200);
    if (!transcript) return json({ error: "empty_transcript" }, 400);

    // Pre-check 5 credits; deduct only after a successful AI response.
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE);
    const { data: creditRow } = await svc
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if ((creditRow?.credits_remaining ?? 0) < COST) return json({ error: "INSUFFICIENT_CREDITS" }, 402);

    // Search the whole app catalog (routes + sub-sections/categories/tools)
    const matches = searchCatalog(transcript, 25);
    const catalogBlock = matches.length
      ? matches.map((m) => `- "${m.path}" ${m.label}`).join("\n")
      : "(no matching destination found)";

    // Call unified AI with tool calling
    const raw = await callOpenAI({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: `The user is currently on route: ${currentRoute}` },
        { role: "system", content: `MATCHING DESTINATIONS in the app catalog:\n${catalogBlock}` },
        { role: "user", content: transcript },
      ],
      model: "gpt-4o-mini",
      tools: [{
        type: "function",
        function: {
          name: "navigate",
          description: "Navigate the app to one of the paths listed in MATCHING DESTINATIONS.",
          parameters: {
            type: "object",
            properties: {
              path: { type: "string", description: "Route path starting with /" } },
            required: ["path"],
            additionalProperties: false } } }],
      tool_choice: "auto",
    });

    const msg = raw?.choices?.[0]?.message ?? {};
    const toolCall = msg.tool_calls?.[0];
    let action: { type: "navigate"; path: string } | null = null;
    if (toolCall?.function?.name === "navigate") {
      try {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        if (typeof args.path === "string" && args.path.startsWith("/") && isKnownPath(args.path)) {
          action = { type: "navigate", path: args.path };
        }
      } catch { /* ignore */ }
    }
    // Fallback: user clearly wanted to find something and the catalog has a match.
    if (!action && matches.length && /\b(find|search|open|show|go to|take me|najdi|vyhlada|otvor|ukaz|chcem)\b/i.test(transcript)) {
      action = { type: "navigate", path: matches[0].path };
    }

    const reply = String(msg.content ?? "").trim()
      || (action ? `Opening ${action.path} for you.` : "Okay.");

    const { data: ok, error: creditErr } = await svc.rpc("deduct_ai_credits", { p_user_id: user.id,
      p_amount: COST,
      p_reason: "Uni voice assistant",
      p_source: "uni-assistant" });
    if (creditErr) return json({ error: creditErr.message }, 500);
    if (ok === false) return json({ error: "INSUFFICIENT_CREDITS" }, 402);

    return json({ reply, action, creditsSpent: COST });
  } catch (e) {
    console.error("uni-assistant error", e);
    return json({ error: (e as Error).message ?? "unknown" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
