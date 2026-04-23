import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sampleId } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // Use OpenAI to generate personalized DNA analysis
    let analysis: any;
    
    if (openaiKey) {
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a DNA analysis AI that generates entertaining fictional genetic analysis results. Generate unique, varied results each time. Return ONLY valid JSON with this exact structure:
{
  "heritage_breakdown": { "region_name": percentage, ... } (5-7 regions, must sum to 100),
  "health_markers": { "marker_name": "status_text", ... } (5-6 markers),
  "genetic_traits": { "trait_name": "value", ... } (6-8 traits),
  "family_tree_data": {
    "generations_traced": number,
    "notable_ancestors": [
      { "name": "full_name", "era": "time_period", "occupation": "job" }
    ]
  }
}
Use creative region names (e.g., "Northern European", "East Asian", "Sub-Saharan African", "Mediterranean", "South Asian", "Indigenous American", "Polynesian"). Make health markers varied (excellent/good/moderate/low risk). Make traits specific and interesting. Generate 3-4 notable ancestors with diverse backgrounds. DISCLAIMER: This is entertainment only.`
            },
            {
              role: "user",
              content: `Generate a unique DNA analysis for sample ID: ${sampleId}. Make it creative and personalized with diverse heritage mix.`
            }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        // Extract JSON from possible markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        analysis = JSON.parse(jsonMatch[1].trim());
      }
    }

    // Fallback if AI fails
    if (!analysis) {
      analysis = {
        heritage_breakdown: { european: 42, east_asian: 25, african: 18, south_asian: 10, native_american: 5 },
        health_markers: { heart_health: "excellent", diabetes_risk: "low", longevity: "above_average" },
        genetic_traits: { eye_color: "brown", hair_type: "wavy", height_potential: "tall", intelligence_markers: "high" },
        family_tree_data: { generations_traced: 6, notable_ancestors: [{ name: "Unknown Ancestor", era: "1800s", occupation: "Explorer" }] }
      };
    }

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

    // Generate AI ancestral memories
    let memories: any[] = [];

    if (openaiKey && analysis.family_tree_data?.notable_ancestors) {
      for (const ancestor of analysis.family_tree_data.notable_ancestors.slice(0, 3)) {
        try {
          const memResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are an ancestral memory reconstruction AI. Write vivid, emotionally rich first-person memories from historical ancestors. Include sensory details, emotions, and historical accuracy. Keep each memory 2-3 paragraphs. Return ONLY valid JSON with: { \"memory_story\": \"...\", \"memory_type\": \"achievement|artistic_moment|pivotal_decision|daily_life|love_story\", \"historical_context\": \"2-3 sentences about the historical period\" }"
                },
                {
                  role: "user",
                  content: `Generate a vivid first-person ancestral memory for: ${ancestor.name}, who lived in the ${ancestor.era} and was a ${ancestor.occupation}. Make it deeply personal and emotionally resonant.`
                }
              ],
            }),
          });

          if (memResponse.ok) {
            const memData = await memResponse.json();
            const memContent = memData.choices[0].message.content;
            const memJsonMatch = memContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, memContent];
            const memParsed = JSON.parse(memJsonMatch[1].trim());

            memories.push({
              user_id: user.id,
              dna_analysis_id: dnaAnalysis.id,
              ancestor_name: ancestor.name,
              ancestor_era: ancestor.era,
              ancestor_location: ancestor.occupation + " era",
              memory_story: memParsed.memory_story,
              memory_type: memParsed.memory_type || "daily_life",
              historical_context: memParsed.historical_context || `During the ${ancestor.era}, ${ancestor.name} lived as a ${ancestor.occupation}.`
            });
          }
        } catch (e) {
          console.error("Error generating memory for", ancestor.name, e);
        }
      }
    }

    // Fallback memories if AI failed
    if (memories.length === 0) {
      memories = [{
        user_id: user.id,
        dna_analysis_id: dnaAnalysis.id,
        ancestor_name: "Unknown Ancestor",
        ancestor_era: "Ancient Times",
        ancestor_location: "Unknown",
        memory_story: "The winds carried whispers of distant lands as I stood at the crossroads of history...",
        memory_type: "daily_life",
        historical_context: "A reconstructed memory from your ancestral lineage."
      }];
    }

    const { error: memoriesError } = await supabaseClient
      .from("ancestral_memories")
      .insert(memories);

    if (memoriesError) console.error("Error inserting memories:", memoriesError);

    return new Response(
      JSON.stringify({ success: true, analysis, memories: memories.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
