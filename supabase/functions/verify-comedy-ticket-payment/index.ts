// Verify a comedy ticket Stripe checkout session, then create the ticket
// and credit the comedian (80%) / platform (20%).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId) return json({ error: "sessionId required" }, 400);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return json({ status: session.payment_status, activated: false });
    }

    const md = (session.metadata ?? {}) as Record<string, string>;
    const showId = md.showId;
    const userId = md.user_id || md.userId;
    const amount = Number(md.amount ?? 0);
    const comedianAmount = Number(md.comedianAmount ?? 0);
    if (!showId || !userId) return json({ error: "Session metadata incomplete" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Idempotency: ticket may already exist from a previous verify call.
    const { data: existing } = await supabase
      .from("comedy_tickets")
      .select("id")
      .eq("user_id", userId)
      .eq("show_id", showId)
      .maybeSingle();

    if (existing) return json({ status: "paid", activated: true, ticketId: existing.id });

    const { data: ticket, error: insertErr } = await supabase
      .from("comedy_tickets")
      .insert({ show_id: showId, user_id: userId, price_paid: amount })
      .select("id")
      .single();
    if (insertErr) throw insertErr;

    // Revenue tracking: show total + comedian earnings (80% share).
    const { data: show } = await supabase
      .from("comedy_shows")
      .select("total_revenue, comedian_id")
      .eq("id", showId)
      .maybeSingle();
    if (show) {
      await supabase
        .from("comedy_shows")
        .update({ total_revenue: Number(show.total_revenue ?? 0) + amount })
        .eq("id", showId);

      const { data: comedian } = await supabase
        .from("comedian_profiles")
        .select("total_earnings")
        .eq("id", show.comedian_id)
        .maybeSingle();
      if (comedian) {
        await supabase
          .from("comedian_profiles")
          .update({ total_earnings: Number(comedian.total_earnings ?? 0) + comedianAmount })
          .eq("id", show.comedian_id);
      }
    }

    return json({ status: "paid", activated: true, ticketId: ticket.id });
  } catch (error) {
    console.error("verify-comedy-ticket-payment error:", error);
    const message = error instanceof Error ? error.message : "Unknown";
    const isStripeBadRequest =
      (error as { type?: string })?.type === "StripeInvalidRequestError" ||
      /No such checkout\.session|Invalid.*sessionId|Missing required param/i.test(message);
    return json({ error: message }, isStripeBadRequest ? 400 : 500);
  }
});
