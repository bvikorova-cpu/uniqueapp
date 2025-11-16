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

    const { planName, goalDescription } = await req.json();

    // Get user's karmic debts to include in plan
    const { data: karmicDebts } = await supabaseClient
      .from("karmic_debts")
      .select("*")
      .eq("user_id", user.id)
      .eq("current_status", "active");

    // Generate comprehensive reincarnation plan
    const plan = {
      plan_name: planName || "My Next Life Journey",
      next_life_goal: goalDescription || "Achieve spiritual enlightenment and complete karmic lessons",
      desired_era: "Future Earth (2100-2200)",
      desired_location: "Advanced spiritual community",
      desired_role: "Spiritual Teacher & Healer",
      soul_missions: [
        {
          mission: "Complete unfinished karmic debts",
          priority: "high",
          estimated_lifetimes: 1,
          progress: 0
        },
        {
          mission: "Guide other souls on their journey",
          priority: "medium",
          estimated_lifetimes: 2,
          progress: 0
        },
        {
          mission: "Contribute to collective consciousness evolution",
          priority: "high",
          estimated_lifetimes: 3,
          progress: 0
        }
      ],
      karmic_lessons_to_complete: karmicDebts?.map(debt => debt.debt_type) || [
        "Practice unconditional love",
        "Master patience and understanding",
        "Achieve balance in all aspects"
      ],
      preservation_protocol: {
        memory_retention: "high",
        skill_transfer: ["Spiritual wisdom", "Healing abilities", "Leadership"],
        soul_signature: "Unique vibrational frequency preserved",
        connection_anchors: ["Soulmate bonds", "Family connections", "Life purpose"],
        awakening_triggers: [
          "Meditation practices",
          "Meeting soulmates",
          "Visiting significant locations",
          "Experiencing déjà vu moments"
        ]
      },
      destiny_mapping: {
        birth_circumstances: "Supportive family environment",
        key_life_events: [
          { age: 7, event: "Spiritual awakening begins" },
          { age: 21, event: "Meet primary soulmate" },
          { age: 33, event: "Master spiritual gifts" },
          { age: 42, event: "Begin teaching others" },
          { age: 63, event: "Complete major karmic lessons" }
        ],
        life_challenges: [
          "Learning to trust intuition",
          "Balancing material and spiritual",
          "Overcoming fear of judgment"
        ],
        success_indicators: [
          "Spiritual community leadership",
          "Healed relationships",
          "Positive karmic balance"
        ]
      }
    };

    // Insert reincarnation plan
    const { data: insertedPlan, error: insertError } = await supabaseClient
      .from("reincarnation_plans")
      .insert({
        user_id: user.id,
        ...plan
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: insertedPlan
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
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
