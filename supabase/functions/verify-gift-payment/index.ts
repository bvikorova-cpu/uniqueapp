// Verify a virtual gift Stripe session and activate the matching gift row.
// Routes by metadata.type: influencer_gift / masterchef_gift / stream_gift / platform_gift.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TABLE_MAP: Record<string, string> = {
  influencer_gift: "influencer_sent_gifts",
  masterchef_gift: "masterchef_sent_gifts",
  stream_gift: "stream_gifts",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ status: session.payment_status, activated: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const giftType = session.metadata?.type as string | undefined;
    const table = giftType ? TABLE_MAP[giftType] : undefined;
    if (!table) {
      return new Response(
        JSON.stringify({ status: "paid", activated: false, reason: `Unsupported gift type: ${giftType}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: updated, error } = await supabase
      .from(table)
      .update({ status: "completed", stripe_session_id: sessionId })
      .eq("stripe_session_id", sessionId)
      .select()
      .maybeSingle();

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: "paid", activated: !!updated, gift: updated, type: giftType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("verify-gift-payment error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
