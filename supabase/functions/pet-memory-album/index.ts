import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, theme, customMemories } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("Missing API key");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You create beautiful narrative memory albums for virtual pets. Return JSON with: album_title (creative title), dedication (short heartfelt dedication), memories (array of 6-8 memory objects with emoji, title, date (fictional date string), description (2-3 emotional sentences), caption (short poetic caption)), closing_note (final heartfelt message about the pet-owner bond)." },
          { role: "user", content: `Create a "${theme}" memory album for ${petName} the ${species}. ${customMemories ? `Include these special memories: ${customMemories}` : ""}` },
        ],
        temperature: 0.9,
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
