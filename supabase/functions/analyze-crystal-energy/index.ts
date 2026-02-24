import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) throw new Error("User not authenticated");

    const { imageUrl } = await req.json();

    console.log("[CRYSTAL-ENERGY] Analyzing crystal image with OpenAI");

    // Use OpenAI to analyze the crystal
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert crystal healer and energy reader. Analyze crystal images and provide detailed energy readings.
            
Return ONLY a valid JSON object with this structure:
{
  "energyLevel": number (70-100),
  "energyAnalysis": "detailed multi-paragraph analysis of the crystal's energy properties",
  "recommendedCrystals": ["crystal1", "crystal2"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this crystal's energy and provide a detailed reading."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[CRYSTAL-ENERGY] OpenAI error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("[CRYSTAL-ENERGY] Parse error:", e);
      analysisResult = null;
    }

    const energyLevel = analysisResult?.energyLevel || Math.floor(Math.random() * 30) + 70;
    const energyAnalysis = analysisResult?.energyAnalysis || content;
    const recommendedCrystals = analysisResult?.recommendedCrystals || ["Amethyst", "Rose Quartz"];

    // Store the reading
    const { data: reading, error } = await supabaseClient
      .from("crystal_energy_readings")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        energy_level: energyLevel,
        energy_analysis: energyAnalysis,
        recommended_crystals: recommendedCrystals,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        reading 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CRYSTAL-ENERGY] ERROR:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
