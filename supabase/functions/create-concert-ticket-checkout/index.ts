// Concert-ticket checkout wrapper.
// Thin shell over _shared/oneOffCheckout (productKey: "concert_ticket").
// Adds pre-checkout DB side-effects:
//   - auth required
//   - loads ticket type (price) + concert
//   - duplicate-guard (user already holds a completed ticket for this concert)
//   - pre-inserts concert_ticket_purchases row (payment_status='pending')
//     with commission split 80% musician / 20% platform
//   - returns Stripe Checkout URL
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_COMMISSION_RATE = 0.20; // 20% platform / 80% musician

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { concertId, ticketTypeId } = await req.json().catch(() => ({}));
    if (!concertId || !ticketTypeId) {
      return new Response(
        JSON.stringify({ error: "concertId and ticketTypeId are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // Auth: use the caller's JWT so RLS is enforced when reading the ticket type.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userData.user;

    // Service client for pre-record + duplicate guard (bypasses RLS).
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Load ticket type — must belong to the given concert.
    const { data: ticketType, error: ttErr } = await supabaseAdmin
      .from("concert_ticket_types")
      .select("id, price, name, concert_id, max_quantity, sold_count")
      .eq("id", ticketTypeId)
      .eq("concert_id", concertId)
      .maybeSingle();
    if (ttErr) throw ttErr;
    if (!ticketType) {
      return new Response(JSON.stringify({ error: "Ticket type not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Sold-out guard.
    if (
      ticketType.max_quantity != null &&
      (ticketType.sold_count ?? 0) >= ticketType.max_quantity
    ) {
      return new Response(JSON.stringify({ error: "Ticket type sold out" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }

    // Duplicate guard — user already holds a completed ticket for this concert.
    const { data: existing } = await supabaseAdmin
      .from("concert_ticket_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("concert_id", concertId)
      .eq("payment_status", "completed")
      .maybeSingle();
    if (existing) {
      return new Response(
        JSON.stringify({ error: "You already own a ticket for this concert" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 },
      );
    }

    // Price stored as an integer in the DB.
    // Interpret it as EUR (whole units) → convert to Stripe minor units (cents).
    const priceCents = Math.round(Number(ticketType.price) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 50) {
      return new Response(JSON.stringify({ error: "Invalid ticket price" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const platformCommission = Math.round(priceCents * PLATFORM_COMMISSION_RATE) / 100;
    const musicianAmount = Number(ticketType.price) - platformCommission;

    // Build Stripe Checkout session via shared builder.
    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";
    const { url, sessionId } = await createOneOffSession({
      productKey: "concert_ticket",
      amount: priceCents,
      name: `Concert Ticket — ${ticketType.name}`,
      userId: user.id,
      userEmail: user.email,
      origin,
      metadata: {
        concertId,
        ticketTypeId,
        musicianAmount: musicianAmount.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
      },
    });

    // Pre-record the purchase (pending). verify-concert-ticket-payment flips it to 'completed'.
    const { error: insertErr } = await supabaseAdmin
      .from("concert_ticket_purchases")
      .insert({
        user_id: user.id,
        concert_id: concertId,
        ticket_type_id: ticketTypeId,
        amount: Number(ticketType.price),
        commission_rate: PLATFORM_COMMISSION_RATE,
        platform_commission: platformCommission,
        musician_amount: musicianAmount,
        payment_status: "pending",
        stripe_session_id: sessionId,
      });
    if (insertErr) {
      console.error("concert-ticket pre-insert failed:", insertErr);
      // Non-fatal: user can still complete Stripe payment, and verify-* will attempt update by session_id.
    }

    return new Response(JSON.stringify({ url, sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("create-concert-ticket-checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
