import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const messageId: string | undefined = body?.id;
    const sessionId: string | undefined = body?.sessionId;
    if (!messageId) throw new Error("id required");

    const { data: row, error } = await admin
      .from("creator_paid_messages")
      .select("id, sender_id, status, stripe_session_id")
      .eq("id", messageId)
      .maybeSingle();
    if (error || !row) throw new Error("Message not found");
    if (row.sender_id !== user.id) throw new Error("Not your message");

    if (row.status === "paid") {
      return new Response(JSON.stringify({ status: "paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });
    const sid = sessionId || row.stripe_session_id;
    if (!sid) throw new Error("No Stripe session on record");
    const session = await stripe.checkout.sessions.retrieve(sid);

    let newStatus: string = row.status ?? "pending";
    if (session.payment_status === "paid") newStatus = "paid";
    else if (session.status === "expired") newStatus = "canceled";

    if (newStatus !== row.status) {
      await admin
        .from("creator_paid_messages")
        .update({ status: newStatus })
        .eq("id", row.id);
    }

    return new Response(
      JSON.stringify({ status: newStatus, payment_status: session.payment_status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    console.error("verify-paid-message error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
