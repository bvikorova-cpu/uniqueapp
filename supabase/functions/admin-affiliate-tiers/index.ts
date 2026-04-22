import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "no auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "unauthenticated" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: u.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const { data: config } = await supabase
      .from("affiliate_tier_config")
      .select("*")
      .order("min_referrals");

    const { data: status } = await supabase
      .from("affiliate_tier_status")
      .select("*")
      .order("lifetime_earnings_eur", { ascending: false })
      .limit(200);

    // Tier breakdown counts
    const counts: Record<string, number> = { bronze: 0, silver: 0, gold: 0, diamond: 0 };
    for (const r of status ?? []) counts[(r as any).tier] = (counts[(r as any).tier] ?? 0) + 1;

    await supabase.from("admin_audit_log").insert({
      admin_id: u.user.id,
      action: "viewed_affiliate_tiers",
      target_type: "affiliate_tier_status",
      target_id: u.user.id,
      details: {},
    });

    return json({ config, status, counts });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
