// Instructor withdrawal request — moves pending_balance into a pending withdrawal
// row for admin processing. Admin uses /admin/withdrawals to approve & pay out
// via Stripe Connect (admin-payout-withdrawal).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MIN_WITHDRAWAL_EUR = 25;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: u, error: uErr } = await supabase.auth.getUser(token);
    if (uErr || !u.user) return json({ error: "Unauthorized" }, 401);
    const user = u.user;

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const paymentMethod = String(body.paymentMethod || "bank_transfer");
    const paymentDetails = body.paymentDetails ?? {};

    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: "Invalid amount" }, 400);
    }
    if (amount < MIN_WITHDRAWAL_EUR) {
      return json({ error: `Minimum withdrawal is €${MIN_WITHDRAWAL_EUR}` }, 400);
    }

    // Resolve instructor profile (auto-create if missing — they earned it)
    let { data: profile } = await supabase
      .from("instructor_profiles")
      .select("id, pending_balance, total_withdrawn")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      const { data: newProf, error: newErr } = await supabase
        .from("instructor_profiles")
        .insert({ user_id: user.id })
        .select("id, pending_balance, total_withdrawn")
        .single();
      if (newErr) return json({ error: newErr.message }, 500);
      profile = newProf;
    }

    const pending = Number(profile.pending_balance || 0);
    if (amount > pending) {
      return json({ error: `Insufficient balance. Available: €${pending.toFixed(2)}` }, 400);
    }

    // Create withdrawal request
    const { data: withdrawal, error: wErr } = await supabase
      .from("instructor_withdrawal_requests")
      .insert({
        instructor_id: profile.id,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending",
      })
      .select()
      .single();
    if (wErr) return json({ error: wErr.message }, 500);

    // Move requested amount out of pending_balance to lock it
    const { error: pErr } = await supabase
      .from("instructor_profiles")
      .update({ pending_balance: pending - amount })
      .eq("id", profile.id);
    if (pErr) return json({ error: pErr.message }, 500);

    // Notify admins
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (admins?.length) {
      await supabase.from("notifications").insert(
        admins.map((a) => ({
          user_id: a.user_id,
          type: "instructor_withdrawal_pending",
          title: "New instructor withdrawal request",
          message: `Instructor requested €${amount.toFixed(2)} via ${paymentMethod}`,
          related_id: withdrawal.id,
          is_read: false,
        })),
      );
    }

    return json({ success: true, withdrawal });
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
