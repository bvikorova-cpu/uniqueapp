import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED = new Set([
  "basketball_coins",
  "hockey_coins",
  "tennis_coins",
  "american_football_coins",
  "football_coins",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const table = String(body.table || "");
    const amount = Number(body.amount || 0);
    const reward = Number(body.reward || 0);
    if (!ALLOWED.has(table)) return json({ error: "invalid_table" }, 400);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) return json({ error: "invalid_amount" }, 400);
    if (!Number.isFinite(reward) || reward < 0 || reward > 1_000_000) return json({ error: "invalid_reward" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get or create row
    const { data: existing } = await admin.from(table).select("*").eq("user_id", user.id).maybeSingle();
    let row = existing;
    if (!row) {
      const { data: created, error: insErr } = await admin.from(table).insert({ user_id: user.id, balance: 0, total_spent: 0 }).select().single();
      if (insErr) return json({ error: "init_failed", details: insErr.message }, 500);
      row = created;
    }

    if ((row.balance ?? 0) < amount) {
      return json({ error: "insufficient_balance", balance: row.balance ?? 0 }, 402);
    }

    const newBalance = (row.balance ?? 0) - amount + reward;
    const newSpent = (row.total_spent ?? 0) + amount;

    const { data: updated, error: updErr } = await admin
      .from(table)
      .update({ balance: newBalance, total_spent: newSpent, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updErr) return json({ error: "update_failed", details: updErr.message }, 500);

    return json({ success: true, balance: updated.balance, spent: amount, reward });
  } catch (e: any) {
    return json({ error: e?.message ?? "internal_error" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
