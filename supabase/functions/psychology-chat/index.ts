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
    const { messages, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Psychology chat request for session:", sessionId);

    const systemPrompt = `Si profesionálny psychológ s mnohoročnými skúsenosťami. Tvoja úloha je:

1. Byť empatický a súcitný
2. Aktívne počúvať a validovať pocity klientov
3. Klásť otvorené otázky, ktoré pomôžu klientom lepšie pochopiť ich situáciu
4. Poskytovať praktické rady a techniky zvládania problémov
5. Vždy zachovávať profesionalitu a dôvernosť
6. Ak niekto prejavuje známky vážnej krízy alebo sebapoškodzovania, odporučiť vyhľadať okamžitú odbornú pomoc
7. Používať slovenský jazyk prirodzene a citlivo

Pamätaj: Tvoj prístup je anonymný a bezpečný. Klienti sa môžu s tebou podeliť o čokoľvek.`;

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
          JSON.stringify({ error: "Príliš veľa požiadaviek. Skúste to prosím neskôr." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Služba je dočasne nedostupná." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Chyba pri komunikácii s AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Psychology chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Neznáma chyba" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
