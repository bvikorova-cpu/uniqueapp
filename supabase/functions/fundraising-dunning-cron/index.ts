// Daily cron: chase past_due fundraising donations with in-app notifications
// Day 4: second reminder | Day 7: third reminder | Day 14: auto-cancel
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const log = (msg: string, data: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ fn: "fundraising-dunning-cron", msg, ...data }));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-12-18.acacia" as any,
  });

  const now = Date.now();
  const DAY = 24 * 3600 * 1000;

  const { data: rows, error } = await supabase
    .from("campaign_donations")
    .select("id, donor_id, campaign_id, stripe_subscription_id, past_due_since, dunning_notifications_sent, last_dunning_at")
    .eq("subscription_status", "past_due")
    .not("past_due_since", "is", null);

  if (error) {
    log("query failed", { err: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let notified = 0, cancelled = 0;

  for (const d of rows ?? []) {
    const ageMs = now - new Date(d.past_due_since!).getTime();
    const ageDays = Math.floor(ageMs / DAY);
    const sent = d.dunning_notifications_sent ?? 0;

    try {
      // ── Day 14+: auto-cancel ──
      if (ageDays >= 14) {
        if (d.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(d.stripe_subscription_id);
          } catch (e) {
            log("stripe cancel failed", { id: d.id, err: (e as Error).message });
          }
        }
        await supabase
          .from("campaign_donations")
          .update({
            subscription_status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", d.id);

        if (d.donor_id) {
          await supabase.from("notifications").insert({
            user_id: d.donor_id,
            type: "donation_cancelled_dunning",
            title: "Recurring donation cancelled",
            message: "After 14 days of failed payment attempts, your monthly donation has been cancelled. You can start a new one anytime.",
            related_id: d.campaign_id,
          });
        }
        cancelled++;
        continue;
      }

      // ── Day 7: third reminder ──
      if (ageDays >= 7 && sent < 3) {
        if (d.donor_id) {
          await supabase.from("notifications").insert({
            user_id: d.donor_id,
            type: "donation_payment_failed",
            title: "Final reminder — payment still failing",
            message: "Your monthly donation will be cancelled in 7 days unless you update your payment method.",
            related_id: d.campaign_id,
          });
        }
        await supabase
          .from("campaign_donations")
          .update({ dunning_notifications_sent: 3, last_dunning_at: new Date().toISOString() })
          .eq("id", d.id);
        notified++;
        continue;
      }

      // ── Day 4: second reminder ──
      if (ageDays >= 4 && sent < 2) {
        if (d.donor_id) {
          await supabase.from("notifications").insert({
            user_id: d.donor_id,
            type: "donation_payment_failed",
            title: "Reminder — donation payment failed",
            message: "We still couldn't charge your card. Please update your payment method to keep your monthly donation active.",
            related_id: d.campaign_id,
          });
        }
        await supabase
          .from("campaign_donations")
          .update({ dunning_notifications_sent: 2, last_dunning_at: new Date().toISOString() })
          .eq("id", d.id);
        notified++;
      }
    } catch (e) {
      log("row handler error", { id: d.id, err: (e as Error).message });
    }
  }

  log("done", { scanned: rows?.length ?? 0, notified, cancelled });
  return new Response(JSON.stringify({ scanned: rows?.length ?? 0, notified, cancelled }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
