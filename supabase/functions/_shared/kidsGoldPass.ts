// Shared helper: returns true if the authenticated user has an active
// Kids Gold Pass (or any Kids-tier subscription that unlocks all Kids modules).
//
// Fast path: reads the `kids_gold_pass_status` cache written by the Stripe
// webhook (`syncKidsGoldPass`) — instant, no Stripe API round-trip. The row is
// updated on every `customer.subscription.*`, `checkout.session.completed`,
// `invoice.payment_*` and `customer.subscription.paused/resumed` event, so
// activations, cancellations and expirations propagate immediately.
//
// Fallback: on cache miss (older users whose row hasn't been written yet), we
// call the universal `check-subscription` edge function once.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export async function hasKidsGoldPass(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  try {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // Resolve user id from the JWT (works even when the row doesn't exist yet).
    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData.user?.id) return false;
    const userId = userData.user.id;

    // Fast path — cache lookup.
    const svc = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: role } = await svc
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (role) return true;

    const { data: row } = await svc
      .from("kids_gold_pass_status")
      .select("active, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (row) {
      const active = !!(row as any).active;
      const end = (row as any).current_period_end as string | null;
      // Trust `active`. If active and period_end is in the past (rare — webhook
      // hasn't fired yet for this renewal), still respect the flag; the next
      // webhook will correct it.
      if (active) return true;
      // If explicitly inactive, don't fall through to Stripe — the webhook is
      // authoritative.
      if (row) return false;
    }

    // Fallback for legacy users with no cache row yet.
    const r = await fetch(`${supabaseUrl}/functions/v1/check-subscription`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "apikey": anonKey,
      },
      body: JSON.stringify({ tier: "kids" }),
    });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j?.subscribed;
  } catch (e) {
    console.error("[kidsGoldPass] check failed:", e);
    return false;
  }
}
