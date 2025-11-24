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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) throw new Error("Unauthorized");

    // Check multiverse access for best self selection
    const { data: hasAccess, error: accessError } = await supabaseClient.rpc(
      'has_multiverse_access',
      {
        user_id_param: user.id,
        service_type_param: 'best_self_selection'
      }
    );

    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "Multiverse subscription required. Please purchase Best Self Selection access." }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Analyzing user's universes...");

    // Get all user's universes
    const { data: universes, error: fetchError } = await supabaseClient
      .from("parallel_universes")
      .select("*")
      .eq("user_id", user.id)
      .order("success_score", { ascending: false })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!universes || universes.length === 0) {
      throw new Error("No universes found. Create some first!");
    }

    console.log("Using AI to analyze best versions...");

    // Use AI to analyze and rank
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI that analyzes parallel universe versions to identify the best possible versions of a person. Consider success, happiness, achievements, and life satisfaction.`,
          },
          {
            role: "user",
            content: `Analyze these parallel universe versions and identify the top 5 best versions:

${universes.map((u, i) => `Version ${i + 1}:
Name: ${u.universe_name}
Description: ${u.universe_description}
Success Score: ${u.success_score}
Divergence: ${u.divergence_point}`).join("\n\n")}

For the top 5 versions, generate a JSON array with objects containing:
{
  "universeId": "the universe id from input",
  "ranking": number (1-5),
  "successMetrics": {
    "career": number (1-100),
    "relationships": number (1-100),
    "health": number (1-100),
    "happiness": number (1-100),
    "achievements": number (1-100)
  },
  "traits": {
    "keyStrengths": ["strength1", "strength2", "strength3"],
    "uniqueQualities": ["quality1", "quality2"]
  },
  "achievements": ["achievement1", "achievement2", "achievement3"],
  "analysis": "brief analysis (50 words)"
}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const analysisResults = JSON.parse(
      aiData.choices[0].message.content.replace(/```json\n?|\n?```/g, "").trim()
    );

    // Save best self versions
    const versionsToSave = analysisResults.map((result: any) => ({
      user_id: user.id,
      universe_id: result.universeId,
      success_metrics: result.successMetrics,
      traits: result.traits,
      achievements: result.achievements,
      ranking: result.ranking,
    }));

    // Delete old versions first
    await supabaseClient
      .from("best_self_versions")
      .delete()
      .eq("user_id", user.id);

    // Insert new versions
    const { data: savedVersions, error: saveError } = await supabaseClient
      .from("best_self_versions")
      .insert(versionsToSave)
      .select(`
        *,
        universe:universe_id(*)
      `);

    if (saveError) throw saveError;

    return new Response(
      JSON.stringify({ success: true, bestVersions: savedVersions, analysis: analysisResults }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in find-best-self:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
