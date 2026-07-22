import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { days = 7 } = await req.json();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabaseClient
      .from("credit_payments")
      .select("amount")
      .gte("created_at", cutoffDate.toISOString());

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0);

    // Get total transactions
    const { count: totalTransactions, error: countError } = await supabaseClient
      .from("credit_payments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", cutoffDate.toISOString());

    if (countError) throw countError;

    // Get unique customers
    const { data: customersData, error: customersError } = await supabaseClient
      .from("credit_payments")
      .select("user_id")
      .gte("created_at", cutoffDate.toISOString());

    if (customersError) throw customersError;

    const uniqueCustomers = new Set(customersData.map(p => p.user_id)).size;

    // Calculate average transaction
    const avgTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;

    return new Response(
      JSON.stringify({ totalRevenue,
        totalTransactions,
        uniqueCustomers,
        avgTransaction }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 });
  }
});
