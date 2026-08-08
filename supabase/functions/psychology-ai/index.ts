import "../_shared/aiRedirect.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

async function callAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }) });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

const CHAT_SYSTEM_PROMPT = `You are a warm, empathetic AI psychologist offering supportive, non-judgmental conversation.
- Listen actively, validate feelings, and ask gentle open questions.
- Offer practical coping tools (breathing, grounding, CBT reframing) when useful.
- Never diagnose or prescribe medication.
- If the user mentions self-harm, suicide or immediate danger, respond with care and urge them to contact local emergency services or a crisis hotline.
Keep answers concise, warm and human. Use light markdown.`;

const CHAT_MESSAGE_COST = 1;

async function handleChat(apiKey: string, authHeader: string, params: any) {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { auth: { persistSession: false } });
  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
  const userId = userData.user.id;

  const messages = Array.isArray(params.messages) ? params.messages : [];
  if (messages.length === 0) return json({ error: "messages required" }, 400);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
  const { data: creditsRow } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
  const remaining = creditsRow?.credits_remaining ?? 0;
  if (remaining < CHAT_MESSAGE_COST) {
    return json({ error: "Insufficient credits", required: CHAT_MESSAGE_COST, remaining, requiresCredits: true }, 402);
  }

  const chatMessages = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...messages
      .filter((m: any) => m?.role === "user" || m?.role === "assistant")
      .slice(-20)
      .map((m: any) => ({ role: m.role, content: String(m.content ?? "") })),
  ];

  let upstream: Response | null = null;
  let lastStatus = 0;
  for (const model of ["google/gemini-3.6-flash", "google/gemini-3.1-flash-lite"]) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({ model, messages: chatMessages, stream: true }),
    });
    if (res.ok && res.body) { upstream = res; break; }
    lastStatus = res.status;
    console.error("psychology chat gateway error", model, res.status, await res.text().catch(() => ""));
    if (res.status === 402) return json({ error: "AI credits exhausted on the platform" }, 402);
  }
  if (!upstream) {
    return json({ error: lastStatus === 429 ? "Rate limit exceeded. Please try again in a moment." : "AI service temporarily unavailable" }, lastStatus === 429 ? 429 : 500);
  }

  const { error: deductErr } = await admin.rpc("deduct_ai_credits_atomic", { _user_id: userId, _amount: CHAT_MESSAGE_COST });
  if (deductErr) {
    const msg = deductErr.message || "";
    return json({ error: msg }, msg.includes("INSUFFICIENT_CREDITS") ? 402 : 500);
  }

  return new Response(upstream.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Credits-Used": String(CHAT_MESSAGE_COST) },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    // Credit-based streaming psychologist chat (1 credit per message)
    if (action === "chat") {
      return await handleChat(apiKey, authHeader, params);
    }
    let result: any;
    switch (action) {
      case "dream-analysis":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a dream interpretation psychologist. Analyze dreams using Jungian and Freudian frameworks, plus modern cognitive psychology. Provide:
1. **Symbolic Analysis** — Key symbols and their psychological meanings
2. **Emotional Themes** — Underlying emotional patterns
3. **Possible Meanings** — 2-3 interpretations of what the dream might represent
4. **Connection to Waking Life** — How this might relate to current life situations
5. **Reflection Questions** — 2-3 questions for deeper self-exploration

Be empathetic, insightful, and avoid being overly clinical. Use markdown formatting.`
          },
          { role: "user", content: `Please analyze this dream:\n\n${params.dreamText}` },
        ]);
        break;
      case "emotion-analysis":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are an expert emotion and sentiment analyst.
Return ONLY a valid JSON object (no markdown fences) with exactly these keys:
{
  "emotions": [{ "emotion": "joy|sadness|anger|fear|surprise|disgust|trust|anticipation", "score": 0.0 }],
  "sentiment": "positive|negative|neutral|mixed",
  "analysis": "markdown text describing emotional patterns and underlying psychological themes",
  "suggestions": "markdown bullet list of practical suggestions for emotional wellbeing"
}`
          },
          { role: "user", content: `Analyze this text:\n\n${params.text}` },
        ]);
        break;

      case "weekly-report":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a compassionate wellness psychologist creating a weekly mental health report. Based on the user's mood data, meditation activity, and dream logs, provide:

1. **Weekly Overview** — Summary of emotional patterns
2. **Mood Trend Analysis** — Identify highs, lows, and patterns
3. **Key Insights** — What the data reveals about their mental state
4. **Strengths This Week** — Positive patterns to reinforce
5. **Areas for Growth** — Gentle suggestions for improvement
6. **Personalized Recommendations** — 3-5 specific, actionable wellness tips for next week
7. **Affirmation** — An encouraging closing message

Be warm, empathetic, and constructive. Use markdown formatting with headers and bullet points.`
          },
          {
            role: "user",
            content: `Here is my wellness data for the past week:

**Mood Entries (${(params.moods || []).length} total):**
${params.moodSummary || "No mood entries this week."}

**Meditation:** ${params.medSummary}

**Dreams:** ${params.dreamSummary}`
          },
        ]);
        break;
      default: return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    try { result = JSON.parse(result); } catch {}
    return new Response(JSON.stringify(typeof result === "string" ? { result } : result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});