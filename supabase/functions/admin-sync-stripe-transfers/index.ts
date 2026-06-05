// S5: Stripe Connect payout reconciliation
// Polls Stripe transfers (last N days) and reconciles them with the 7 withdrawal tables.
// Marks drift: transfers that exist in Stripe but not in our DB → audit row;
// rows marked "completed" without a matching live Stripe transfer → flagged as drift.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABLES: { name: string; transferCol: string }[] = [
  { name: "instructor_withdrawal_requests", transferCol: "stripe_transfer_id" },
  { name: "musician_withdrawal_requests", transferCol: "stripe_transfer_id" },
  { name: "masterchef_withdrawal_requests", transferCol: "stripe_transfer_id" },
  { name: "influencer_withdrawal_requests", transferCol: "stripe_transfer_id" },
  { name: "auction_withdrawal_requests", transferCol: "stripe_payout_id" },
  { name: "referral_withdrawal_requests", transferCol: "stripe_transfer_id" },
  { name: "withdrawal_requests", transferCol: "stripe_transfer_id" },
];

const log = (s: string, d?: unknown) =>
  console.log(`[SYNC-TRANSFERS] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json().catch(() => ({}));
    const isCron = body?.source === "cron";
    const days = Math.min(Math.max(Number(body?.days ?? 14), 1), 90);

    // Admin gate for non-cron
    if (!isCron) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Missing Authorization");
      const { data: u } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (!u?.user) throw new Error("Not authenticated");
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: u.user.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Admin only");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const since = Math.floor((Date.now() - days * 86400 * 1000) / 1000);
    log("scan window", { days, since });

    // 1) Pull Stripe transfers in window
    const stripeTransfers = new Map<string, Stripe.Transfer>();
    let starting_after: string | undefined = undefined;
    let page = 0;
    while (page < 20) {
      const res: Stripe.ApiList<Stripe.Transfer> = await stripe.transfers.list({
        limit: 100,
        created: { gte: since },
        starting_after,
      });
      for (const t of res.data) stripeTransfers.set(t.id, t);
      if (!res.has_more) break;
      starting_after = res.data[res.data.length - 1]?.id;
      page++;
    }
    log("stripe transfers fetched", { count: stripeTransfers.size, pages: page + 1 });

    // 2) For each withdrawal table, reconcile
    const report: Record<string, { matched: number; drift_missing_in_stripe: number; updated: number }> = {};
    const seenInDb = new Set<string>();

    for (const { name, transferCol } of TABLES) {
      const r = { matched: 0, drift_missing_in_stripe: 0, updated: 0 };
      const { data: rows, error } = await supabase
        .from(name)
        .select(`id, status, ${transferCol}, processed_at, amount`)
        .gte("created_at", new Date(since * 1000).toISOString())
        .limit(2000);

      if (error) { log("table query failed", { table: name, error: error.message }); report[name] = r; continue; }

      for (const row of rows ?? []) {
        const transferId = (row as any)[transferCol] as string | null;
        if (transferId) {
          seenInDb.add(transferId);
          const st = stripeTransfers.get(transferId);
          if (st) {
            r.matched++;
            // If the row isn't marked completed yet but Stripe transfer exists → fix it.
            if (row.status !== "completed") {
              await supabase
                .from(name)
                .update({
                  status: "completed",
                  processed_at: row.processed_at ?? new Date(st.created * 1000).toISOString(),
                })
                .eq("id", row.id);
              r.updated++;
            }
          } else if (row.status === "completed") {
            // Marked completed but transfer not in Stripe window — could be older; only flag.
            r.drift_missing_in_stripe++;
          }
        }
      }
      report[name] = r;
    }

    // 3) Stripe transfers NOT in any DB row → ghost transfers (audit only)
    const ghosts: { id: string; amount: number; destination: string | null }[] = [];
    for (const [id, t] of stripeTransfers) {
      if (!seenInDb.has(id)) {
        ghosts.push({
          id,
          amount: t.amount,
          destination: typeof t.destination === "string" ? t.destination : t.destination?.id ?? null,
        });
      }
    }

    // 4) Audit log if anything noteworthy
    if (ghosts.length || Object.values(report).some((r) => r.updated || r.drift_missing_in_stripe)) {
      await supabase.from("admin_audit_log").insert({
        action: "stripe_transfers_reconciled",
        details: { days, report, ghost_count: ghosts.length, ghosts: ghosts.slice(0, 50) },
      }).then(({ error }) => error && log("audit insert failed", error.message));
    }

    log("done", { report, ghost_count: ghosts.length });

    return new Response(
      JSON.stringify({
        ok: true,
        days,
        stripe_transfer_count: stripeTransfers.size,
        report,
        ghost_count: ghosts.length,
        ghosts: ghosts.slice(0, 50),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
