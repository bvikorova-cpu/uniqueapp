import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
    // Use ANON KEY - RLS policies will enforce access control
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { days = 30 } = await req.json();

    // Get mood logs from the last N days
    const { data: moodLogs, error } = await supabaseClient
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("log_date", { ascending: true });

    if (error) throw error;

    // Get journal entries for emotional trends
    const { data: journals } = await supabaseClient
      .from("journal_entries")
      .select("mood, emotions_detected, entry_date")
      .eq("user_id", user.id)
      .gte("entry_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("entry_date", { ascending: true });

    // Mock analysis - no AI API needed
    const moodCount = moodLogs?.length || 0;
    const journalCount = journals?.length || 0;
    
    const trendsData = {
      trend: moodCount > 10 ? "improving" : "stable",
      summary: `Za posledných ${days} dní ste zaznamenali ${moodCount} záznamov nálady a ${journalCount} denníkových záznamov. Vaša nálada sa zdá byť stabilná s občasnými výkyvmi.`,
      patterns: [
        "Pravidelné zapisovanie pomáha lepšie pochopiť vaše emócie",
        "Sledujte, ako rôzne aktivity ovplyvňujú vašu náladu",
        "Všímajte si vzorce v čase dňa a týždňa"
      ],
      recommendations: [
        "Pokračujte v pravidelnom sledovaní svojej nálady",
        "Venujte čas aktivitám, ktoré vám prinášajú radosť",
        "Udržiavajte zdravý spánkový režim",
        "Spojte sa s priateľmi a rodinou"
      ],
      warnings: moodCount < 5 ? ["Málo dát pre presnejšiu analýzu. Pokračujte v pravidelnom zapisovaní."] : []
    };

    return new Response(
      JSON.stringify({ ...trendsData, moodLogs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});