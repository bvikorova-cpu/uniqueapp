import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[MONETIZATION-IDEAS] ${step}`, details || "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme, context } = await req.json();
    
    if (!theme) {
      throw new Error("Theme is required");
    }

    logStep("Generating ideas", { theme, context });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a creative monetization strategist specializing in entertainment platforms. 
You excel at creating innovative revenue models for horror, comedy, mystery, and other entertainment genres.
Your suggestions are practical, engaging, and maximize user engagement while creating sustainable revenue streams.`;

    const userPrompt = `Generate 5 unique monetization ideas for a platform focused on: ${theme}

${context ? `Additional context: ${context}` : ''}

For each idea provide:
1. Name - catchy name for the feature
2. Description - 2-3 sentences explaining the concept
3. Revenue Model - how it generates money (subscription, pay-per-use, freemium, etc.)
4. Target Audience - who would use this
5. Estimated Price Point - suggested pricing in EUR
6. Engagement Hook - what makes users want to pay for this

Focus on:
- User psychology and emotional engagement
- Unique experiences that feel premium
- Creating FOMO (fear of missing out)
- Community and social features
- Gamification elements

Return creative, unexpected ideas that blend entertainment with monetization seamlessly.`;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_monetization_ideas",
              description: "Generate structured monetization ideas",
              parameters: {
                type: "object",
                properties: {
                  ideas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        revenue_model: { type: "string" },
                        target_audience: { type: "string" },
                        price_point: { type: "string" },
                        engagement_hook: { type: "string" }
                      },
                      required: ["name", "description", "revenue_model", "target_audience", "price_point", "engagement_hook"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["ideas"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_monetization_ideas" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      logStep("OpenAI API Error", { status: response.status, error: errorText });
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    logStep("AI Response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const ideas = JSON.parse(toolCall.function.arguments);
    logStep("Ideas generated", { count: ideas.ideas?.length });

    return new Response(
      JSON.stringify(ideas),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});