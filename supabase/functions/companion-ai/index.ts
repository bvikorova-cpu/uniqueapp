import { callOpenAI } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

async function callAI(messages: any[]) {
  return callOpenAI({ messages, model: "gpt-4o-mini", max_completion_tokens: 600 });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, character, otherCompanions, historyFormatted, message, characterList, mood, context, characterIds, conversationHistory, ...params } = await req.json();
    let result: any;
    switch (action) {
      case "group-chat": {
        // Load the selected companions from the DB
        let chars: any[] = [];
        if (Array.isArray(characterIds) && characterIds.length) {
          const supaUrl = Deno.env.get("SUPABASE_URL")!;
          const supaKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const res = await fetch(
            `${supaUrl}/rest/v1/ai_characters?id=in.(${characterIds.join(",")})&select=id,name,personality_type,system_prompt`,
            { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } },
          );
          chars = await res.json();
          if (!Array.isArray(chars)) chars = [];
          // keep the selection order
          chars = characterIds.map((id: string) => chars.find((c: any) => c.id === id)).filter(Boolean);
        } else if (character) {
          chars = [character];
        }

        if (!chars.length) {
          return new Response(JSON.stringify({ error: "No companions selected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const history = (conversationHistory || historyFormatted || [])
          .filter((m: any) => m?.content)
          .slice(-12)
          .map((m: any) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.role === "assistant" && m.name ? `${m.name}: ${m.content}` : m.content,
          }));

        const responses: { companion_name: string; response: string }[] = [];
        for (const c of chars) {
          const others = chars.filter((o: any) => o.id !== c.id).map((o: any) => o.name).join(", ");
          const said = responses.map((r) => `${r.companion_name}: ${r.response}`).join("\n");
          try {
            const text = await callAI([
              {
                role: "system",
                content: `${c.system_prompt || `You are ${c.name}, an AI companion (${c.personality_type || "friendly"}).`}\n\nYou are ${c.name} in a GROUP CHAT with ${others || "other companions"}. Keep responses short (1-3 sentences). Stay in character. Reply only with your own message, no name prefix.${said ? `\n\nAlready said in this turn:\n${said}` : ""}`,
              },
              ...history,
              { role: "user", content: message || "Hi" },
            ]);
            if (text) responses.push({ companion_name: c.name, response: text });
          } catch (_e) {
            // skip a failing companion rather than breaking the whole group turn
          }
        }

        if (!responses.length) {
          return new Response(JSON.stringify({ error: "AI is busy, please try again" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ responses }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "memory-analyze":
        result = await callAI([
          {
            role: "system",
            content: `Analyze this conversation and extract key memory points about the user. Return JSON: {"summary":"2-3 sentence summary of relationship and topics","memory_context":{"name":"user's name if mentioned","interests":["list"],"topics_discussed":["list"],"emotional_patterns":["list"]}}`
          },
          { role: "user", content: message || JSON.stringify(historyFormatted || []) }
        ]);
        break;
      case "mood-matcher":
        result = await callAI([
          {
            role: "system",
            content: `You are a mood analysis AI. Based on the user's mood, recommend the best AI companion from this list:\n${characterList || "[]"}\n\nRespond in JSON: {"recommended_companion":"name","reason":"why this companion is perfect","mood_insight":"brief analysis of user's emotional state","conversation_starters":["3 suggested opening messages"]}`
          },
          { role: "user", content: mood || "neutral" }
        ]);
        break;
      case "voice-message":
        result = await callAI([
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
