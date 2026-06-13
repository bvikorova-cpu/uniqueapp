const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, character, otherCompanions, historyFormatted, message, characterList, mood, context, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "group-chat":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `${character?.system_prompt || "You are an AI companion."}\n\nYou are in a GROUP CHAT with ${otherCompanions || "other companions"}. Keep responses short (1-3 sentences). Stay in character. You may reference or respond to what other companions said. Be natural and conversational.`
          },
          ...(historyFormatted || []),
          { role: "user", content: message || "" },
        ]);
        break;
      case "memory-analyze":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `Analyze this conversation and extract key memory points about the user. Return JSON: {"summary":"2-3 sentence summary of relationship and topics","memory_context":{"name":"user's name if mentioned","interests":["list"],"topics_discussed":["list"],"emotional_patterns":["list"]}}`
          },
          { role: "user", content: message || JSON.stringify(historyFormatted || []) }
        ]);
        break;
      case "mood-matcher":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a mood analysis AI. Based on the user's mood, recommend the best AI companion from this list:\n${characterList || "[]"}\n\nRespond in JSON: {"recommended_companion":"name","reason":"why this companion is perfect","mood_insight":"brief analysis of user's emotional state","conversation_starters":["3 suggested opening messages"]}`
          },
          { role: "user", content: mood || "neutral" }
        ]);
        break;
      case "voice-message":
        result = await callAI(apiKey, [
          { role: "system", content: character?.system_prompt || "You are an AI companion." },
          { role: "user", content: message || "" },
        ]);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    try { result = JSON.parse(result); } catch {}
    return new Response(JSON.stringify(typeof result === "string" ? { result } : result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
