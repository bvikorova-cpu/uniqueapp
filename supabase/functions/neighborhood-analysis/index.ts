import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { address } = await req.json();
    if (!address) throw new Error("Address required");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a real estate neighborhood analyst. Return JSON with: safety (1-10), schools (1-10), transport (1-10), amenities (1-10), nightlife (1-10), green_spaces (1-10), overall (1-10), summary (string), pros (array of strings), cons (array of strings)." },
          { role: "user", content: `Analyze the neighborhood around: ${address}` },
        ],
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    const analysis = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
