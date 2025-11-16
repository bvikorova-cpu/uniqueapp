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

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) throw new Error("User not authenticated");

    const { sampleId } = await req.json();

    // Simulate DNA analysis processing
    const analysis = {
      heritage_breakdown: {
        european: 45.3,
        african: 12.8,
        asian: 28.4,
        native_american: 8.2,
        middle_eastern: 5.3
      },
      health_markers: {
        heart_health: "excellent",
        diabetes_risk: "low",
        alzheimers_risk: "moderate",
        athletic_performance: "high",
        longevity_markers: "above_average"
      },
      genetic_traits: {
        eye_color: "brown",
        hair_type: "wavy",
        height_potential: "tall",
        intelligence_markers: "high",
        creativity_markers: "very_high",
        empathy_level: "high"
      },
      family_tree_data: {
        generations_traced: 8,
        notable_ancestors: [
          { name: "Marie Dubois", era: "1800s", occupation: "Artist" },
          { name: "James Sullivan", era: "1750s", occupation: "Merchant" },
          { name: "Wei Chen", era: "1820s", occupation: "Scholar" }
        ]
      }
    };

    // Insert DNA analysis
    const { data: dnaAnalysis, error: insertError } = await supabaseClient
      .from("dna_analyses")
      .insert({
        user_id: user.id,
        sample_id: sampleId,
        analysis_data: analysis,
        heritage_breakdown: analysis.heritage_breakdown,
        health_markers: analysis.health_markers,
        genetic_traits: analysis.genetic_traits,
        family_tree_data: analysis.family_tree_data,
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Generate 3 ancestral memories
    const memories = [
      {
        user_id: user.id,
        dna_analysis_id: dnaAnalysis.id,
        ancestor_name: "Marie Dubois",
        ancestor_era: "1850s Paris",
        ancestor_location: "Montmartre, Paris",
        memory_story: "I remember the morning light streaming through the atelier window, illuminating the canvas before me. The scent of oil paints mixed with fresh bread from the boulangerie below. In those days, women artists were rare, but I was determined. Each brushstroke was an act of rebellion, each painting a declaration of my existence.",
        memory_type: "artistic_moment",
        historical_context: "During the mid-19th century, the Montmartre district of Paris was becoming a hub for artists and bohemians. Women faced significant barriers in pursuing artistic careers, yet some persevered."
      },
      {
        user_id: user.id,
        dna_analysis_id: dnaAnalysis.id,
        ancestor_name: "James Sullivan",
        ancestor_era: "1760s Boston",
        ancestor_location: "Boston Harbor",
        memory_story: "The salt spray hit my face as our merchant vessel entered Boston Harbor. Twenty years at sea had taught me that fortune favors the bold. In my leather satchel were contracts that would change our family's destiny - trade agreements with merchants in three colonies. Mother would finally have that house she dreamed of.",
        memory_type: "pivotal_decision",
        historical_context: "Colonial merchants played a crucial role in the economic development of the American colonies, often taking significant risks for potential rewards."
      },
      {
        user_id: user.id,
        dna_analysis_id: dnaAnalysis.id,
        ancestor_name: "Wei Chen",
        ancestor_era: "1825 Qing Dynasty",
        ancestor_location: "Suzhou, China",
        memory_story: "The examination halls were silent except for the scratch of brushes on paper. For three days and nights, we had been writing, our minds tested to their limits. My grandfather was a scholar, my father a scholar - the weight of tradition rested on these words. Outside, the gardens of Suzhou waited, but inside, I crafted the arguments that would secure my family's future.",
        memory_type: "achievement",
        historical_context: "The imperial examination system was the primary path to government positions in Qing Dynasty China, with scholars spending years preparing for these rigorous tests."
      }
    ];

    const { error: memoriesError } = await supabaseClient
      .from("ancestral_memories")
      .insert(memories);

    if (memoriesError) console.error("Error inserting memories:", memoriesError);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: dnaAnalysis,
        memories: memories.length 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
