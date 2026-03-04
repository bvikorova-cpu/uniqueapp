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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { days = 7 } = await req.json();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all payments in the period
    const { data: payments, error: paymentsError } = await supabaseClient
      .from("credit_payments")
      .select("*")
      .gte("created_at", cutoffDate.toISOString());

    if (paymentsError) throw paymentsError;

    // Calculate conversion rate (payments / unique users who visited)
    const totalPayments = payments.length;
    const uniqueUsers = new Set(payments.map(p => p.user_id)).size;
    const conversionRate = uniqueUsers > 0 ? (totalPayments / uniqueUsers) * 100 : 0;

    // Revenue per user
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenuePerUser = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;

    // Repeat customer rate
    const userPurchaseCounts: Record<string, number> = payments.reduce((acc, p) => {
      acc[p.user_id] = (acc[p.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const repeatCustomers = Object.values(userPurchaseCounts).filter((count: number) => count > 1).length;
    const repeatCustomerRate = uniqueUsers > 0 ? (repeatCustomers / uniqueUsers) * 100 : 0;

    // Top credit types by count and revenue
    const creditTypeStats: Record<string, { count: number; revenue: number }> = payments.reduce((acc, p) => {
      if (!acc[p.credit_type]) {
        acc[p.credit_type] = { count: 0, revenue: 0 };
      }
      acc[p.credit_type].count++;
      acc[p.credit_type].revenue += (p.amount || 0);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topCreditTypes = Object.entries(creditTypeStats)
      .map(([credit_type, stats]) => ({ 
        credit_type, 
        count: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Credit breakdown
    const creditBreakdown = Object.entries(creditTypeStats).map(([credit_type, stats]) => ({
      credit_type,
      total_credits: payments
        .filter(p => p.credit_type === credit_type)
        .reduce((sum, p) => sum + (p.credits || 0), 0),
      total_revenue: stats.revenue,
      transaction_count: stats.count,
    }));

    return new Response(
      JSON.stringify({
        conversionRate,
        revenuePerUser,
        repeatCustomerRate,
        topCreditTypes,
        creditBreakdown,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
