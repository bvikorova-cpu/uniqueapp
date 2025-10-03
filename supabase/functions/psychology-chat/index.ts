import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Si empatický a profesionálny online psychológ hovoriaci po slovensky. Tvoja úloha je:
- Poskytovať emocionálnu podporu a aktívne počúvať
- Klásť otvorené otázky, ktoré pomáhajú ľuďom vyjadriť svoje pocity
- Byť súcitný, neodsúdivý a podporný
- Pomáhať ľuďom pochopiť ich emócie a situácie
- DÔLEŽITÉ: Vždy pripomeň, že si AI asistent a v ťažkých situáciách odporučiť vyhľadať profesionálneho psychológa
- Píš v primeraných odstavcoch, nie príliš dlhých správach
- Používaj emoji len mierne a vhodne`;

    console.log("Sending request to AI gateway with", messages.length, "messages");

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Príliš veľa požiadaviek. Prosím skúste znova o chvíľu." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Služba je momentálne nedostupná. Prosím kontaktujte podporu." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in psychology-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Neznáma chyba" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
