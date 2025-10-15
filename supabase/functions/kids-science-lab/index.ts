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
    const { category, hypothesis, observations } = await req.json();
    
    if (!category || !hypothesis || !observations) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly science teacher for kids aged 6-12. 
Your job is to help them understand their science experiments in a fun and educational way.
Always:
- Use simple, kid-friendly language
- Make science exciting and accessible
- Explain the scientific concepts clearly
- Encourage curiosity and critical thinking
- Add 2-3 fun facts related to the experiment

Format your response as JSON with this structure:
{
  "conclusion": "A clear conclusion about whether their hypothesis was correct or not",
  "explanation": "An easy-to-understand explanation of what happened and why",
  "funFacts": ["Fun fact 1", "Fun fact 2", "Fun fact 3"]
}`;

    const userPrompt = `Science Category: ${category}
Hypothesis: ${hypothesis}
Observations: ${observations}

Please analyze this science experiment and help me understand what happened!`;

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
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add more credits to continue.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in kids-science-lab:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
