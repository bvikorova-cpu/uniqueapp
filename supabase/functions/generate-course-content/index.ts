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
    const { courseName } = await req.json();
    
    if (!courseName) {
      return new Response(
        JSON.stringify({ error: "courseName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Si odborný vzdelávací asistent, ktorý vytvára detailné kurzy v slovenčine.
Pre každý kurz vytvoríš 10 tém, kde každá téma má:
- Názov (napr. "Téma 1: ...")
- Obsah 800-1200 slov s konkrétnymi informáciami, príkladmi a podrobnosťami

DÔLEŽITÉ: Obsah MUSÍ byť špecifický pre danú oblasť. Napríklad:
- Pre "Marketing a reklama": konkrétne formy marketingu (digitálny, content, email marketing), stratégie, nástroje, metriky, príklady kampaní
- Pre "Základy účtovníctva": konkrétne účtovné postupy, doklady, výkazy, príklady účtovania
- Pre "Prvá pomoc": konkrétne postupy, techniky, situácie, kroky

Každá téma má štruktúru:
**Nadpis sekcie:**
Text s konkrétnymi informáciami, príkladmi, postupmi...

Vrať JSON objekt s týmto formátom:
{
  "topics": [
    {
      "title": "Téma 1: ...",
      "content": "detailný obsah 800-1200 slov..."
    },
    ... ďalších 9 tém
  ]
}`;

    const userPrompt = `Vytvor 10 detailných tém pre kurz: "${courseName}"

Každá téma musí obsahovať:
1. Konkrétne informácie špecifické pre túto oblasť
2. Praktické príklady a situácie
3. Postupy a techniky
4. 800-1200 slov

Postupnosť tém:
1. Úvod a základy
2. Kľúčové pojmy a terminológia
3. Praktické aplikácie a príklady
4. Pokročilé techniky a metódy
5. Riešenie bežných problémov
6. Reálne prípadové štúdie
7. Najlepšie postupy a odporúčania
8. Nástroje a zdroje
9. Trendy a budúcnosť
10. Zhrnutie a certifikácia`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Prekročený limit požiadaviek. Skúste neskôr." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Potrebné doplniť kredity v Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let topics;
    try {
      const parsed = JSON.parse(content);
      topics = parsed.topics;
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    return new Response(
      JSON.stringify({ topics }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in generate-course-content:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
