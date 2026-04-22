// Called by the frontend right after signup when the user arrived via ?ref=CODE.
// Locks in who referred them. The actual €5 reward is credited later by
// stripe-webhook on customer.subscription.created.

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

    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Missing auth" }, 401);
    const token = auth.replace("Bearer ", "");
    const { data: u } = await supabase.auth.getUser(token);
    const user = u.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { code } = await req.json().catch(() => ({}));
    if (!code || typeof code !== "string") return json({ error: "Missing code" }, 400);

    // Resolve code → referrer. Try megatalent_referral_codes first, fall back to
    // the deterministic UNIQ-{first6chars} format used by ReferralCard.
    let referrerId: string | null = null;
    const { data: codeRow } = await supabase
      .from("megatalent_referral_codes")
      .select("user_id")
      .eq("code", code)
      .maybeSingle();
    if (codeRow?.user_id) referrerId = codeRow.user_id;

    if (!referrerId && code.startsWith("UNIQ-")) {
      const prefix = code.slice(5).toLowerCase();
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .ilike("id", `${prefix}%`)
        .limit(1)
        .maybeSingle();
      if (prof?.id) referrerId = prof.id;
    }

    if (!referrerId) return json({ error: "Invalid referral code" }, 404);
    if (referrerId === user.id) return json({ error: "Cannot self-refer" }, 400);

    // Already attributed?
    const { data: existing } = await supabase
      .from("referral_attributions")
      .select("id, referrer_id")
      .eq("referred_user_id", user.id)
      .maybeSingle();
    if (existing) return json({ ok: true, alreadyClaimed: true });

    const { error } = await supabase.from("referral_attributions").insert({
      referrer_id: referrerId,
      referred_user_id: user.id,
      code,
    });
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, referrerId });
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
