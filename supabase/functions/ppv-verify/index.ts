import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    const { data: unlock } = await admin
      .from("influking_ppv_unlocks")
      .select("id, status")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (!unlock) throw new Error("Unlock record not found");

    if (paid && unlock.status !== "completed") {
      await admin
        .from("influking_ppv_unlocks")
        .update({
          status: "completed",
          stripe_payment_intent_id: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
          unlocked_at: new Date().toISOString(),
        })
        .eq("id", unlock.id);
    }

    return new Response(JSON.stringify({ verified: paid, status: session.payment_status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("ppv-verify error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
