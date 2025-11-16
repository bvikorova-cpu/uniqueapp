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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) throw new Error("Not authenticated");

    const { name, powerType } = await req.json();

    if (!name || !powerType) {
      throw new Error("Name and power type are required");
    }

    // Check age verification (18+)
    const { data: ageCheck } = await supabaseClient
      .from('superhero_age_verification')
      .select('is_verified')
      .eq('user_id', user.id)
      .single();

    if (!ageCheck?.is_verified) {
      return new Response(
        JSON.stringify({ error: "Age verification required. You must be 18+ to play." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Check hero count limit (max 3 per user)
    const { count } = await supabaseClient
      .from('superhero_heroes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: "Maximum 3 heroes per user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Determine rarity (random with weighted chances)
    const rarityRoll = Math.random() * 100;
    let rarity;
    let statsMultiplier;
    if (rarityRoll < 45) {
      rarity = 'common';
      statsMultiplier = 1.0;
    } else if (rarityRoll < 75) {
      rarity = 'rare';
      statsMultiplier = 1.1;
    } else if (rarityRoll < 90) {
      rarity = 'epic';
      statsMultiplier = 1.25;
    } else if (rarityRoll < 98) {
      rarity = 'legendary';
      statsMultiplier = 1.5;
    } else {
      rarity = 'mythic';
      statsMultiplier = 2.0;
    }

    // Generate random stats based on power type and rarity
    const baseStats = {
      strength: Math.floor((30 + Math.random() * 40) * statsMultiplier),
      speed: Math.floor((30 + Math.random() * 40) * statsMultiplier),
      intelligence: Math.floor((30 + Math.random() * 40) * statsMultiplier),
      defense: Math.floor((30 + Math.random() * 40) * statsMultiplier),
    };

    // Boost primary stat based on power type
    const boosts: Record<string, keyof typeof baseStats> = {
      strength: 'strength',
      speed: 'speed',
      intelligence: 'intelligence',
      energy: 'defense',
      elemental: 'intelligence'
    };
    
    const primaryStat = boosts[powerType];
    if (primaryStat) {
      baseStats[primaryStat] = Math.floor(baseStats[primaryStat] * 1.5);
    }

    const powerLevel = Object.values(baseStats).reduce((a, b) => a + b, 0) * 5;

    // Create hero
    const { data: hero, error: heroError } = await supabaseClient
      .from('superhero_heroes')
      .insert({
        user_id: user.id,
        name,
        power_type: powerType,
        rarity,
        power_level: powerLevel,
        ...baseStats
      })
      .select()
      .single();

    if (heroError) throw heroError;

    console.log(`Hero created: ${hero.name} (${rarity}) - Power Level: ${powerLevel}`);

    return new Response(
      JSON.stringify({ hero }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
