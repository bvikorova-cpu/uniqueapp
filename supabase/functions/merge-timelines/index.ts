import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Check multiverse access for timeline merging
    const { data: hasAccess, error: accessError } = await supabaseClient.rpc(
      'has_multiverse_access',
      {
        user_id_param: user.id,
        service_type_param: 'timeline_merging'
      }
    );

    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "Multiverse subscription required. Please purchase Timeline Merging access." }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { universeIds } = await req.json();

    if (!universeIds || universeIds.length < 2) {
      throw new Error("Need at least 2 universes to merge");
    }

    console.log("Fetching universes to merge...");

    // Get the universes
    const { data: universes, error: fetchError } = await supabaseClient
      .from("parallel_universes")
      .select("*")
      .in("id", universeIds)
      .eq("user_id", user.id);

    if (fetchError) throw fetchError;
    if (!universes || universes.length !== universeIds.length) {
      throw new Error("Some universes not found");
    }

    console.log("Merging timelines with AI...");

    // Use AI to merge the timelines
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI that merges parallel timeline scenarios into an optimized combined reality. Analyze the best elements of each timeline.`,
          },
          {
            role: "user",
            content: `Merge these parallel universes into one optimal timeline:

${universes.map((u, i) => `Universe ${i + 1}: ${u.universe_name}
Description: ${u.universe_description}
Success Score: ${u.success_score}
Divergence: ${u.divergence_point}`).join("\n\n")}

Generate a JSON response with:
{
  "mergedName": "name for merged universe",
  "description": "detailed merged description (250 words)",
  "successScore": number (1-100),
  "optimizations": ["optimization1", "optimization2", "optimization3"],
  "bestElements": ["element1", "element2", "element3"],
  "synergies": ["synergy1", "synergy2"]
}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const mergedData = JSON.parse(
      aiData.choices[0].message.content.replace(/```json\n?|\n?```/g, "").trim()
    );

    // Create the merged universe
    const { data: mergedUniverse, error: createError } = await supabaseClient
      .from("parallel_universes")
      .insert({
        user_id: user.id,
        universe_name: mergedData.mergedName,
        universe_description: mergedData.description,
        parameters: {
          merged: true,
          optimizations: mergedData.optimizations,
          bestElements: mergedData.bestElements,
          synergies: mergedData.synergies,
          sourceUniverses: universeIds,
        },
        divergence_point: "Timeline Merge",
        success_score: mergedData.successScore,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Record the merge
    const { error: mergeError } = await supabaseClient
      .from("timeline_merges")
      .insert({
        user_id: user.id,
        merged_universe_ids: universeIds,
        result_universe_id: mergedUniverse.id,
        optimization_data: mergedData,
      });

    if (mergeError) throw mergeError;

    return new Response(
      JSON.stringify({ success: true, mergedUniverse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in merge-timelines:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
