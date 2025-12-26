import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = Deno.env.get("SUPABASE_URL") && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    ? await import("https://esm.sh/@supabase/supabase-js@2.57.2").then(mod => 
        mod.createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )
      )
    : null;

  try {
    const { category, hypothesis, observations } = await req.json();
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader && supabaseClient) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      userId = userData.user?.id || null;
    }
    
    if (!category || !hypothesis || !observations) {
      throw new Error("Missing required fields");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    // Increment usage counter if user is authenticated
    if (userId && supabaseClient) {
      try {
        const { data: currentUsage } = await supabaseClient
          .from('kids_science_usage')
          .select('experiments_this_month')
          .eq('user_id', userId)
          .maybeSingle();

        await supabaseClient
          .from('kids_science_usage')
          .upsert({
            user_id: userId,
            experiments_this_month: (currentUsage?.experiments_this_month || 0) + 1,
            last_reset_date: new Date().toISOString().split('T')[0]
          }, { onConflict: 'user_id' });
      } catch (usageError) {
        console.error("Error updating usage:", usageError);
      }
    }

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
