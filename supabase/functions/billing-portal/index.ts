import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser } from "../_shared/supabaseClient.ts";
import { createStripeClient, getStripeCustomer } from "../_shared/stripe.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user } = await authenticateUser(req);
    if (!user.email) throw new Error("User email missing");

    const stripe = createStripeClient();
    const customerId = await getStripeCustomer(stripe, user.email);
    if (!customerId) throw new Error("No Stripe customer found — subscribe first");

    let return_url: string | undefined;
    try {
      const body = await req.json();
      return_url = body?.return_url;
    } catch { /* no body */ }
    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || `${origin}/profile` });

    return new Response(JSON.stringify({ url: portal.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "error";
    console.error("[billing-portal]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
