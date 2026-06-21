import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAKRA_SCHEDULE = [
  { day: 1, chakra: "Root Chakra (Muladhara)", color: "Red" },
  { day: 2, chakra: "Sacral Chakra (Svadhisthana)", color: "Orange" },
  { day: 3, chakra: "Solar Plexus Chakra (Manipura)", color: "Yellow" },
  { day: 4, chakra: "Heart Chakra (Anahata)", color: "Green" },
  { day: 5, chakra: "Throat Chakra (Vishuddha)", color: "Blue" },
  { day: 6, chakra: "Third Eye Chakra (Ajna)", color: "Indigo" },
  { day: 7, chakra: "Crown Chakra (Sahasrara)", color: "Violet" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session ID");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const featureKey = session.metadata?.feature_key;
    const featureName = session.metadata?.feature || "Unknown";
    const userId = session.metadata?.user_id;

    if (userId !== user.id) throw new Error("User mismatch");

    // Check if already verified (idempotent)
    const { data: existing } = await supabase
      .from("crystal_purchases")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_verified: true, purchase_id: existing.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create purchase record
    const isSubscription = featureKey === "premiumEncyclopedia";
    const { data: purchase, error: insertErr } = await supabase
      .from("crystal_purchases")
      .insert({
        user_id: user.id,
        feature_key: featureKey,
        feature_name: featureName,
        stripe_session_id: sessionId,
        status: "active",
        expires_at: isSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // For chakra balancing, create 7 days of content
    if (featureKey === "chakraBalancing" && purchase) {
      const today = new Date();
      const days = CHAKRA_SCHEDULE.map((ch) => ({
        purchase_id: purchase.id,
        user_id: user.id,
        day_number: ch.day,
        chakra_name: ch.chakra,
        is_unlocked: ch.day === 1,
        unlock_date: new Date(today.getTime() + (ch.day - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }));

      await supabase.from("crystal_chakra_days").insert(days);
    }

    // Generate AI content based on feature
    let generatedContent = null;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (openaiKey && (featureKey === "aiEnergyReading" || featureKey === "energyHealing")) {
      const prompts: Record<string, string> = {
        aiEnergyReading: `Generate a detailed AI energy reading report. Include:
1. Overall Energy Level (score 1-100)
2. Aura Analysis (colors, patterns, intensity)
3. Energy Blockages (locations, causes)
4. Crystal Recommendations (3-5 crystals with explanations)
5. Healing Suggestions (daily practices)
Format as a comprehensive wellness report.`,
        energyHealing: `Create a personalized 1-hour energy healing session plan. Include:
1. Pre-Session Preparation (10 min) - breathing exercises, setting intentions
2. Energy Assessment (10 min) - body scan, identifying blockages
3. Crystal Placement Guide (15 min) - specific crystals for each chakra
4. Guided Meditation Script (15 min) - visualization for healing
5. Post-Session Integration (10 min) - grounding, journaling prompts
6. Follow-up Recommendations - daily practices for next 7 days
Format as a step-by-step healing guide.`,
      };

      try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are an expert crystal healer and energy practitioner. Provide detailed, personalized wellness content." },
              { role: "user", content: prompts[featureKey] || "Generate a crystal energy report." },
            ],
            max_completion_tokens: 2000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          generatedContent = aiData.choices?.[0]?.message?.content;

          // Store generated content in metadata
          await supabase
            .from("crystal_purchases")
            .update({ metadata: { generated_content: generatedContent } })
            .eq("id", purchase.id);
        }
      } catch (e) {
        console.error("AI generation error:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, purchase_id: purchase.id, generated_content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-crystal-payment error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
