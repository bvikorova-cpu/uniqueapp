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

    // Fetch existing karmic debts
    const { data: existingDebts } = await supabaseClient
      .from("karmic_debts")
      .select("*")
      .eq("user_id", user.id);

    // Calculate overall karma balance
    const totalBalance = (existingDebts || []).reduce((sum, debt) => sum + (debt.balance_score || 0), 0);
    const averageBalance = existingDebts && existingDebts.length > 0 
      ? Math.round(totalBalance / existingDebts.length)
      : 50;

    // Generate new karmic insights
    const debtTypes = [
      "Relationship Karma",
      "Career Lessons",
      "Health & Wellness",
      "Financial Balance",
      "Spiritual Growth",
      "Family Dynamics"
    ];

    const insights = {
      overall_balance: averageBalance,
      status: averageBalance >= 70 ? "Excellent" : averageBalance >= 50 ? "Balanced" : averageBalance >= 30 ? "Working Progress" : "Needs Attention",
      total_debts: existingDebts?.length || 0,
      active_debts: existingDebts?.filter(d => d.current_status === 'active').length || 0,
      resolved_debts: existingDebts?.filter(d => d.current_status === 'resolved').length || 0,
      recommendations: [
        "Practice daily mindfulness meditation",
        "Perform acts of kindness without expectation",
        "Forgive those who have wronged you",
        "Seek to understand before being understood",
        "Give back to your community"
      ],
      daily_actions: [
        { action: "Morning gratitude practice", karma_points: 5 },
        { action: "Help someone in need", karma_points: 10 },
        { action: "Forgive a past grievance", karma_points: 15 },
        { action: "Donate to charity", karma_points: 8 },
        { action: "Practice compassion", karma_points: 7 }
      ]
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        debts: existingDebts || []
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
