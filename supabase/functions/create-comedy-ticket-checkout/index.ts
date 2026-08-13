// Comedy-show ticket checkout (real money, EUR).
// Thin shell over _shared/oneOffCheckout (productKey: "comedy_ticket").
//   - auth required
//   - loads show + price, duplicate guard (user already owns a ticket)
//   - 80% comedian / 20% platform split recorded in Stripe metadata
//   - verify-comedy-ticket-payment creates the comedy_tickets row after payment
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_COMMISSION_RATE = 0.20; // 20% platform / 80% comedian

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { showId } = await req.json().catch(() => ({}));
    if (!showId) return json({ error: "showId is required" }, 400);

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "Missing Authorization header" }, 401);

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userData.user?.email) return json({ error: "Not authenticated" }, 401);
    const user = userData.user;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: show, error: showErr } = await supabaseAdmin
      .from("comedy_shows")
      .select("id, title, ticket_price_coins, comedian_id, status")
      .eq("id", showId)
      .maybeSingle();
    if (showErr) throw showErr;
    if (!show) return json({ error: "Show not found" }, 404);
    if (show.status === "ended") return json({ error: "This show has already ended" }, 409);

    const { data: existing } = await supabaseAdmin
      .from("comedy_tickets")
      .select("id")
      .eq("user_id", user.id)
      .eq("show_id", showId)
      .maybeSingle();
    if (existing) return json({ error: "You already own a ticket for this show" }, 409);

    // ticket_price_coins is interpreted as EUR (whole units) → Stripe cents.
    const priceEur = Number(show.ticket_price_coins);
    const priceCents = Math.round(priceEur * 100);
    if (!Number.isFinite(priceCents) || priceCents < 50) {
      return json({ error: "Invalid ticket price" }, 400);
    }

    const platformCommission = Math.round(priceCents * PLATFORM_COMMISSION_RATE) / 100;
    const comedianAmount = priceEur - platformCommission;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";
    const { url, sessionId } = await createOneOffSession({
      productKey: "comedy_ticket",
      amount: priceCents,
      name: `Comedy Ticket — ${show.title}`,
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: "/comedy-club?view=browse&comedy_payment=success",
      cancelPath: "/comedy-club?view=browse&comedy_payment=canceled",
      metadata: {
        showId: String(showId),
        comedianId: String(show.comedian_id),
        amount: priceEur.toFixed(2),
        comedianAmount: comedianAmount.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
      },
    });

    return json({ url, sessionId });
  } catch (error) {
    console.error("create-comedy-ticket-checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});
