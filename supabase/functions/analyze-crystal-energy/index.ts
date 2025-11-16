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
    
    if (!user?.email) throw new Error("User not authenticated");

    const { imageUrl } = await req.json();

    // Simulate AI analysis (in production, use actual AI service)
    const energyLevel = Math.floor(Math.random() * 30) + 70; // 70-100
    const crystalTypes = [
      "Amethyst", "Rose Quartz", "Clear Quartz", "Citrine", 
      "Black Tourmaline", "Selenite", "Labradorite"
    ];
    
    const recommendedCrystals = [
      crystalTypes[Math.floor(Math.random() * crystalTypes.length)],
      crystalTypes[Math.floor(Math.random() * crystalTypes.length)]
    ];

    const energyAnalysis = `Your crystal exhibits a strong energy signature with a reading of ${energyLevel}%. 
    
The energy patterns suggest:
• High vibrational frequency indicating purity
• Strong alignment with crown and heart chakras
• Excellent for meditation and spiritual work
• Natural amplification properties detected
• Protective energy shield present

This crystal appears to be genuine and possesses excellent metaphysical properties. The energy resonance suggests it has been naturally formed and contains minimal artificial enhancements.

Recommended complementary crystals: ${recommendedCrystals.join(", ")}`;

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
