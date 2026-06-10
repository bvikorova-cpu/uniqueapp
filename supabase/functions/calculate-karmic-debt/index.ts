// Aggregates karmic_debts rows for the user and returns Insights.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify active access
    const { data: purchase } = await admin
      .from("reincarnation_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_type", "karmic_debt_calculator")
      .eq("status", "active")
      .maybeSingle();
    if (!purchase) return json({ error: "Subscription required", requiresPayment: true }, 402);

    const { data: debts } = await admin
      .from("karmic_debts")
      .select("*")
      .eq("user_id", user.id);
    const list = debts ?? [];

    const total_debts = list.length;
    const resolved_debts = list.filter((d: any) => d.current_status === "resolved" || d.resolved_at).length;
    const active_debts = total_debts - resolved_debts;
    const balanceAvg = list.length
      ? Math.round(list.reduce((s: number, d: any) => s + (Number(d.balance_score) || 50), 0) / list.length)
      : 50;
    const overall_balance = total_debts === 0 ? 50 : Math.min(100, Math.max(0, balanceAvg + (resolved_debts * 5)));

    const status = overall_balance >= 75 ? "Harmonious" : overall_balance >= 50 ? "Balanced" : overall_balance >= 25 ? "Strained" : "Heavy";

    const daily_actions = [
      { action: "Meditate 10 minutes on past-life forgiveness", karma_points: 5 },
      { action: "Perform an anonymous act of kindness", karma_points: 8 },
      { action: "Journal one debt and a reparative step", karma_points: 6 },
      { action: "Call or message someone you wronged", karma_points: 10 },
      { action: "Donate time or money to a cause aligned with your debts", karma_points: 12 },
    ];

    return json({
      insights: {
        overall_balance,
        total_debts,
        resolved_debts,
        active_debts,
        status,
        daily_actions,
        debts: list,
      },
    });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
