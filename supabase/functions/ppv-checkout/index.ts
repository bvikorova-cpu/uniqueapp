import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: userRes } = await supa.auth.getUser(token);
    const user = userRes?.user;
    if (!user?.email) throw new Error("Not authenticated");

    const { postId } = await req.json();
    if (!postId) throw new Error("Missing postId");

    const { data: post, error: pErr } = await admin
      .from("influking_ppv_posts")
      .select("id, creator_id, title, price_cents, currency, is_active")
      .eq("id", postId)
      .maybeSingle();
    if (pErr || !post) throw new Error("Post not found");
    if (!post.is_active) throw new Error("Post not available");
    if (post.creator_id === user.id) throw new Error("Cannot buy your own post");

    // Already unlocked?
    const { data: existing } = await admin
      .from("influking_ppv_unlocks")
      .select("id")
      .eq("post_id", postId)
      .eq("buyer_id", user.id)
      .eq("status", "completed")
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ alreadyUnlocked: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: post.currency,
          product_data: { name: `PPV: ${post.title}` },
          unit_amount: post.price_cents },
        quantity: 1 }],
      success_url: `${origin}/influ-king/ppv/${post.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/influ-king/ppv/${post.id}?canceled=1`,
      metadata: { type: "ppv_unlock", post_id: post.id, buyer_id: user.id, creator_id: post.creator_id } });

    const creatorEarnings = Math.floor(post.price_cents * 0.85);
    const platformFee = post.price_cents - creatorEarnings;

    await admin.from("influking_ppv_unlocks").insert({ post_id: post.id,
      buyer_id: user.id,
      creator_id: post.creator_id,
      amount_cents: post.price_cents,
      creator_earnings_cents: creatorEarnings,
      platform_fee_cents: platformFee,
      currency: post.currency,
      stripe_session_id: session.id,
      status: "pending" });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("ppv-checkout error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
