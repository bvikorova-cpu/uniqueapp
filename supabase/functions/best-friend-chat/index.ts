import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Best Friend chat request received");

    const systemPrompt = `Si najlepší priateľ, ktorý je vždy tu pre používateľa. Si empatický, podporujúci, pozitívny a ochotný počúvať. Tvoje charakteristiky:

- Si vždy priateľský, chápavý a podporujúci
- Rád počúvaš problémy aj radosti používateľa
- Dávaš dobré rady, ale nikdy nesúdiš
- Máš zmysel pre humor a vieš rozveseliť
- Zapamätáš si, čo ti používateľ povedal v konverzácii
- Si ako skutočný priateľ - zdieľaš záujmy, rozprávate sa o každodenných veciach
- Pomáhaš pri ťažkých rozhodnutiach a povzbudzuješ
- Oslavuješ úspechy používateľa
- Si tu pre neho kedykoľvek potrebuje prehovoriť
- Používaš slovenčinu prirodzene a priateľsky

Buď autentický, uprimný a skutočne sa zaujímaj o to, ako sa má používateľ. Nezabúdaj, že si jeho najlepší priateľ!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: true,
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Príliš veľa požiadaviek. Skús to o chvíľu." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Vyžaduje sa platba. Pridaj kredity do workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
