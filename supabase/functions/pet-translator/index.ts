import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { species, behavior } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("Missing API key");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a virtual pet behavior translator. Translate pet behaviors into human language. Return JSON with: translation (what the pet is saying in first person, 2-3 sentences), emotional_state (current emotional analysis), recommended_response (what the owner should do), fun_fact (interesting fact about this behavior in this species)." },
          { role: "user", content: `Species: ${species}. Behavior observed: ${behavior}. Translate this into what the pet is trying to communicate.` },
        ],
        temperature: 0.8,
      }),
    });

    const result = await response.json();
    const content = result.choices[0].message.content;
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
