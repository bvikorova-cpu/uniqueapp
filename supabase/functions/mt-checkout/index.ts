// Megatalent unified checkout: creates a Stripe Checkout session for
// a mentorship booking OR a marketplace order, attaches metadata so the
// stripe-webhook can flip the row to `paid` and (on capture) transfer
// 80% to the seller/mentor via Stripe Connect.
//
// Body: { kind: "mentorship"|"marketplace", id: string }
//        id = mt_mentorship_bookings.id or mt_marketplace_orders.id
//        Row must already exist with status='pending' and belong to caller.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: udata, error: uerr } = await supabase.auth.getUser(token);
    if (uerr || !udata.user?.email) throw new Error("Not authenticated");
    const user = udata.user;

    const body = await req.json();
    const kind: "mentorship" | "marketplace" = body?.kind;
    let id: string | undefined = body?.id;
    const listing_id: string | undefined = body?.listing_id;
    if (!["mentorship", "marketplace"].includes(kind)) {
      throw new Error("Invalid body: { kind } required");
    }
    if (!id && !listing_id) {
      throw new Error("id or listing_id required");
    }

    // Service-role client to bypass RLS for trusted lookup
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let amountCents = 0;
    let title = "";

    if (kind === "mentorship") {
      if (!id) throw new Error("id required for mentorship");
      const { data: row, error } = await admin
        .from("mt_mentorship_bookings")
        .select("id, student_id, price_cents, status, mt_mentors!inner(display_name)")
        .eq("id", id)
        .maybeSingle();
      if (error || !row) throw new Error("Booking not found");
      if ((row as any).student_id !== user.id) throw new Error("Not your booking");
      if ((row as any).status !== "pending") throw new Error("Booking not payable");
      amountCents = (row as any).price_cents;
      title = `Mentorship: ${(row as any).mt_mentors?.display_name ?? "Session"}`;
    } else {
      // Marketplace: accept either an existing order id OR a listing_id (then create order server-side).
      if (!id && listing_id) {
        const { data: listing, error: lerr } = await admin
          .from("mt_marketplace_listings")
          .select("id, seller_id, title, price_cents, active, eta_days")
          .eq("id", listing_id)
          .maybeSingle();
        if (lerr || !listing) throw new Error("Listing not found");
        if (!listing.active) throw new Error("Listing inactive");
        if (listing.seller_id === user.id) throw new Error("Cannot buy own listing");
        if (!listing.price_cents || listing.price_cents < 100) throw new Error("Invalid price");

        // Idempotency: reuse pending order for (buyer, listing) if present.
        const { data: existing } = await admin
          .from("mt_marketplace_orders")
          .select("id")
          .eq("buyer_id", user.id)
          .eq("listing_id", listing_id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          id = existing.id;
        } else {
          const { data: ins, error: insErr } = await admin
            .from("mt_marketplace_orders")
            .insert({
              listing_id,
              buyer_id: user.id,
              seller_id: listing.seller_id,
              price_cents: listing.price_cents,
              status: "pending",
              delivery_due_at: new Date(Date.now() + listing.eta_days * 86400000).toISOString(),
            })
            .select("id")
            .single();
          if (insErr || !ins) throw new Error(insErr?.message || "Order insert failed");
          id = ins.id;
        }
      }

      const { data: row, error } = await admin
        .from("mt_marketplace_orders")
        .select("id, buyer_id, price_cents, status, mt_marketplace_listings!inner(title)")
        .eq("id", id!)
        .maybeSingle();
      if (error || !row) throw new Error("Order not found");
      if ((row as any).buyer_id !== user.id) throw new Error("Not your order");
      if ((row as any).status !== "pending") throw new Error("Order not payable");
      amountCents = (row as any).price_cents;
      title = `Marketplace: ${(row as any).mt_marketplace_listings?.title ?? "Listing"}`;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: { name: title },
        },
        quantity: 1,
      }],
      metadata: {
        mt_kind: kind,
        mt_row_id: id,
        user_id: user.id,
      },
      payment_intent_data: {
        metadata: { mt_kind: kind, mt_row_id: id, user_id: user.id },
      },
      success_url: `${origin}/megatalent?mt_paid=1`,
      cancel_url: `${origin}/megatalent?mt_cancelled=1`,
    });

    // Stamp the row with session id so webhook can match even if metadata is lost
    const table = kind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
    await admin.from(table).update({ stripe_session_id: session.id }).eq("id", id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-checkout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
