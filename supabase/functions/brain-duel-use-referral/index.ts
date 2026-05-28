import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { referralCode } = await req.json();
    if (!referralCode) throw new Error("Referral code required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Look up code
    const { data: codeData } = await supabase
      .from("brain_duel_referral_codes")
      .select("*")
      .eq("code", referralCode.toUpperCase())
      .maybeSingle();

    if (!codeData) {
      return new Response(JSON.stringify({ error: "Invalid referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (codeData.user_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot use your own referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already referred
    const { data: existingRef } = await supabase
      .from("brain_duel_referrals")
      .select("id")
      .eq("referred_id", user.id)
      .maybeSingle();

    if (existingRef) {
      return new Response(JSON.stringify({ error: "You have already used a referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BONUS_CREDITS = 10;

    // Create referral record
    await supabase.from("brain_duel_referrals").insert({
      referrer_id: codeData.user_id,
      referred_id: user.id,
      referral_code: referralCode.toUpperCase(),
      bonus_credits_awarded: BONUS_CREDITS,
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    // Update referral code stats
    await supabase
      .from("brain_duel_referral_codes")
      .update({
        total_referrals: (codeData.total_referrals || 0) + 1,
        total_bonus_credits: (codeData.total_bonus_credits || 0) + BONUS_CREDITS,
      })
      .eq("id", codeData.id);

    // Add credits to both users
    for (const uid of [user.id, codeData.user_id]) {
      const { data: existingCredits } = await supabase
        .from("brain_duel_credits")
        .select("credits")
        .eq("user_id", uid)
        .maybeSingle();

      if (existingCredits) {
        await supabase
          .from("brain_duel_credits")
          .update({ credits: existingCredits.credits + BONUS_CREDITS })
          .eq("user_id", uid);
      } else {
        await supabase
          .from("brain_duel_credits")
          .insert({ user_id: uid, credits: BONUS_CREDITS });
      }
    }

    // Create notifications
    await supabase.from("brain_duel_notifications").insert([
      {
        user_id: user.id,
        type: "referral",
        title: "Referral Bonus!",
        message: `You earned ${BONUS_CREDITS} bonus credits from using a referral code!`,
      },
      {
        user_id: codeData.user_id,
        type: "referral",
        title: "Referral Reward!",
        message: `Someone used your referral code! You earned ${BONUS_CREDITS} bonus credits!`,
      },
    ]);

    return new Response(JSON.stringify({ success: true, bonusCredits: BONUS_CREDITS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
