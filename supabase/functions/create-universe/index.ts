import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Check multiverse access
    const { data: hasAccess, error: accessError } = await supabaseClient.rpc(
      'has_multiverse_access',
      {
        user_id_param: user.id,
        service_type_param: 'universe_creation'
      }
    );

    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "Multiverse subscription required. Please purchase Universe Creation access." }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { universeName, divergencePoint, parameters } = await req.json();

    console.log("Creating universe with AI...");

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Call AI to generate universe
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a creative AI that generates detailed parallel universe scenarios. Create realistic alternate reality descriptions based on divergence points.`,
          },
          {
            role: "user",
            content: `Create a parallel universe where: ${divergencePoint}. Universe name: ${universeName}. Parameters: ${JSON.stringify(parameters)}. 

Generate a JSON response with:
{
  "description": "detailed universe description (200 words)",
  "majorDifferences": ["difference1", "difference2", "difference3"],
  "successScore": number (1-100),
  "keyEvents": ["event1", "event2", "event3"],
  "opportunities": ["opportunity1", "opportunity2"]
}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const universeData = JSON.parse(
      aiData.choices[0].message.content.replace(/```json\n?|\n?```/g, "").trim()
    );

    // Save to database
    const { data: universe, error: dbError } = await supabaseClient
      .from("parallel_universes")
      .insert({
        user_id: user.id,
        universe_name: universeName,
        universe_description: universeData.description,
        parameters: {
          ...parameters,
          majorDifferences: universeData.majorDifferences,
          keyEvents: universeData.keyEvents,
          opportunities: universeData.opportunities,
        },
        divergence_point: divergencePoint,
        success_score: universeData.successScore,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, universe }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-universe:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
