// Admin overview of win-back campaigns + manual create + 90d KPIs.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData.user?.id;
    if (!userId) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { data: roleOk } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!roleOk) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "create") {
      const {
        targetUserId,
        email,
        stripeCustomerId,
        stripeSubscriptionId,
        percentOff = 50,
        durationMonths = 3,
        expiresInDays = 14,
      } = body;
      if (!targetUserId || !email) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: row, error } = await supabase
        .from("winback_campaigns")
        .insert({
          user_id: targetUserId,
          email,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          offer_percent_off: percentOff,
          offer_duration_months: durationMonths,
          offer_expires_at: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("admin_audit_log").insert({
        admin_id: userId,
        action: "winback_created",
        target_table: "winback_campaigns",
        target_id: row.id,
        details: { email, percentOff },
      });

      return new Response(JSON.stringify({ campaign: row }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: list + KPIs
    const since = new Date(Date.now() - 90 * 86400000).toISOString();
    const [{ data: rows }, { count: total90 }, { count: claimed90 }] = await Promise.all([
      supabase
        .from("winback_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("winback_campaigns")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("winback_campaigns")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since)
        .eq("status", "claimed"),
    ]);

    const claimRate = total90 ? (claimed90 ?? 0) / total90 : 0;

    return new Response(
      JSON.stringify({
        rows: rows ?? [],
        kpis: {
          total_90d: total90 ?? 0,
          claimed_90d: claimed90 ?? 0,
          claim_rate: claimRate,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
