import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Generate AI horror challenge
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a horror story challenge creator. Generate unique, atmospheric horror writing prompts."
          },
          {
            role: "user",
            content: "Create a horror story challenge with: 1) A compelling theme, 2) 3-5 keywords that must be used, 3) A specific environment/setting. Format as JSON."
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_horror_challenge",
              description: "Generate a horror story writing challenge",
              parameters: {
                type: "object",
                properties: {
                  theme: { type: "string", description: "Main horror theme" },
                  keywords: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 keywords that must appear in the story"
                  },
                  environment: { type: "string", description: "Setting/environment for the story" },
                  prompt: { type: "string", description: "The full challenge prompt" }
                },
                required: ["theme", "keywords", "environment", "prompt"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_horror_challenge" } }
      })
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const challenge = JSON.parse(toolCall?.function?.arguments || "{}");

    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + 1);

    const { data: battle, error: battleError } = await supabaseClient
      .from('shadow_battles')
      .insert({
        challenge_prompt: challenge.prompt,
        challenge_theme: challenge.theme,
        challenge_keywords: challenge.keywords,
        status: 'waiting_for_participants',
        ends_at: endsAt.toISOString()
      })
      .select()
      .single();

    if (battleError) throw battleError;

    return new Response(JSON.stringify({ 
      success: true, 
      battle,
      challenge
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Create battle error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
