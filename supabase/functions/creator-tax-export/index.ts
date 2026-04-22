// Generates a yearly tax-export CSV for the authenticated creator covering
// every successful withdrawal/payout across all 7 hub types. Returns a text/csv
// response that the frontend triggers as a download.
//
// Body: { year: number }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KIND_MAP = {
  instructor: { table: "instructor_withdrawal_requests", userCol: "instructor_id" },
  musician:   { table: "musician_withdrawal_requests",   userCol: "musician_id" },
  masterchef: { table: "masterchef_withdrawal_requests", userCol: "chef_id" },
  influencer: { table: "influencer_withdrawal_requests", userCol: "influencer_id" },
  auction:    { table: "auction_withdrawal_requests",    userCol: "seller_id" },
  referral:   { table: "referral_withdrawal_requests",   userCol: "referrer_id" },
  campaign:   { table: "withdrawal_requests",            userCol: "user_id" },
} as const;

const log = (s: string, d?: unknown) =>
  console.log(`[CREATOR-TAX-EXPORT] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supaUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u.user) throw new Error("Not authenticated");
    const userId = u.user.id;

    const body = await req.json().catch(() => ({}));
    const year = Number(body.year ?? new Date().getFullYear());
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      throw new Error("Invalid year");
    }

    const start = `${year}-01-01T00:00:00Z`;
    const end = `${year + 1}-01-01T00:00:00Z`;
    log("export start", { userId, year });

    const admin = createClient(supaUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    type Row = {
      hub: string;
      id: string;
      amount_eur: number;
      processed_at: string;
      stripe_transfer_id: string | null;
    };
    const all: Row[] = [];

    for (const [hub, cfg] of Object.entries(KIND_MAP)) {
      const { data, error } = await admin
        .from(cfg.table)
        .select("id, amount, processed_at, stripe_transfer_id, stripe_payout_id, status")
        .eq(cfg.userCol, userId)
        .in("status", ["completed", "paid", "approved"])
        .gte("processed_at", start)
        .lt("processed_at", end);
      if (error) {
        log(`fetch failed for ${hub}`, { msg: error.message });
        continue;
      }
      for (const r of data || []) {
        all.push({
          hub,
          id: r.id,
          amount_eur: Number(r.amount) || 0,
          processed_at: r.processed_at,
          stripe_transfer_id: (r as any).stripe_transfer_id ?? (r as any).stripe_payout_id ?? null,
        });
      }
    }

    all.sort((a, b) => +new Date(a.processed_at) - +new Date(b.processed_at));

    const totalsByHub: Record<string, number> = {};
    let grandTotal = 0;
    for (const r of all) {
      totalsByHub[r.hub] = (totalsByHub[r.hub] || 0) + r.amount_eur;
      grandTotal += r.amount_eur;
    }

    const lines: string[] = [];
    lines.push(`Tax Export ${year}`);
    lines.push(`Creator,${csvEscape(u.user.email)}`);
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push("");
    lines.push("Hub,Withdrawal ID,Amount (EUR),Processed At,Stripe Transfer ID");
    for (const r of all) {
      lines.push(
        [
          csvEscape(r.hub),
          csvEscape(r.id),
          r.amount_eur.toFixed(2),
          csvEscape(r.processed_at),
          csvEscape(r.stripe_transfer_id),
        ].join(","),
      );
    }
    lines.push("");
    lines.push("Summary by hub,Amount (EUR)");
    for (const [hub, sum] of Object.entries(totalsByHub)) {
      lines.push(`${csvEscape(hub)},${sum.toFixed(2)}`);
    }
    lines.push("");
    lines.push(`TOTAL ${year},${grandTotal.toFixed(2)}`);

    const csv = lines.join("\n");
    log("export done", { rows: all.length, total: grandTotal });

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tax-export-${year}.csv"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
