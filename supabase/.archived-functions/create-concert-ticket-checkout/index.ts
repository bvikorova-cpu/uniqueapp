// Concert ticket checkout – wrapper for shared one-off router
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createOneOffSession } from "../_shared/oneOffCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) =>
  console.log(`[CREATE-CONCERT-TICKET-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    log("Function started");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authErr } = await supabase.auth.getUser(token);
    const user = data.user;
    if (authErr || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const { concertId, ticketTypeId } = await req.json();
    if (!concertId || !ticketTypeId) throw new Error("Missing required fields");

    const { data: ticketType, error: ticketError } = await supabase
      .from("concert_ticket_types")
      .select("*, live_concert_streams(title, musician_id)")
      .eq("id", ticketTypeId)
      .single();
    if (ticketError || !ticketType) throw new Error("Ticket type not found");

    const { data: musician } = await supabase
      .from("musician_profiles")
      .select("stage_name")
      .eq("id", ticketType.live_concert_streams.musician_id)
      .single();

    // Prevent double-purchase
    const { data: existing } = await supabase
      .from("concert_ticket_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("concert_id", concertId)
      .eq("payment_status", "completed")
      .single();
    if (existing) throw new Error("You already have a ticket for this concert");

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const { url, sessionId } = await createOneOffSession({
      productKey: "concert_ticket",
      amount: Math.round(Number(ticketType.price) * 100),
      name: `${String(ticketType.name).toUpperCase()} Ticket - ${ticketType.live_concert_streams.title}`,
      description: `Live concert by ${musician?.stage_name || "Artist"}`,
      userId: user.id,
      userEmail: user.email,
      origin,
      successPath: `/live-concerts?success=true&type=ticket`,
      cancelPath: `/live-concerts?canceled=true`,
      metadata: {
        user_id: user.id,
        concert_id: concertId,
        ticket_type_id: ticketTypeId,
        musician_id: ticketType.live_concert_streams.musician_id,
        type: "concert_ticket",
      },
    });

    log("Checkout session created", { sessionId });

    // Pre-record purchase as pending so verify-* can finalize it
    await supabase.from("concert_ticket_purchases").insert({
      user_id: user.id,
      concert_id: concertId,
      ticket_type_id: ticketTypeId,
      amount: Number(ticketType.price),
      musician_amount: Number((Number(ticketType.price) * 0.8).toFixed(2)),
      platform_commission: Number((Number(ticketType.price) * 0.2).toFixed(2)),
      commission_rate: 0.2,
      payment_status: "pending",
      stripe_session_id: sessionId,
    });

    return new Response(JSON.stringify({ url, session_id: sessionId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    const msg = error instanceof Error ? error.message : String(error);
    const status = /not authenticated|unauthorized/i.test(msg) ? 401
      : /missing|not found|already have|unsupported|required/i.test(msg) ? 400
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status,
    });
  }
});
