import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

// PPV DM — create a Stripe Checkout session that unlocks a paid message
// (photo/video) inside Messenger. 85% of the amount goes to the sender,
// 15% platform fee (same split as gifts / Super Chats / paid DMs).

const CREATOR_SHARE = 0.85;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await supabaseAuth.auth.getUser();
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { messageId } = await req.json();
    if (!messageId) {
      return new Response(JSON.stringify({ error: 'Missing messageId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('id, sender_id, ppv_price_cents, content')
      .eq('id', messageId)
      .maybeSingle();

    if (msgError || !message) {
      return new Response(JSON.stringify({ error: 'Message not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!message.ppv_price_cents || message.ppv_price_cents <= 0) {
      return new Response(JSON.stringify({ error: 'This message is not a paid message' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (message.sender_id === user.id) {
      return new Response(JSON.stringify({ error: 'You cannot unlock your own message' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Already unlocked (or in flight) for this buyer?
    const { data: existing } = await supabaseAdmin
      .from('message_ppv_unlocks')
      .select('id, status, stripe_session_id')
      .eq('message_id', messageId)
      .eq('buyer_id', user.id)
      .maybeSingle();

    if (existing?.status === 'paid') {
      return new Response(JSON.stringify({ alreadyUnlocked: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-11-20.acacia' });
    const origin = req.headers.get('origin') ?? 'https://uniqueapp.fun';
    const amountCents = message.ppv_price_cents;
    const creatorPayoutCents = Math.floor(amountCents * CREATOR_SHARE);

    // Reuse an in-flight checkout if one exists.
    if (existing?.status === 'pending' && existing.stripe_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(existing.stripe_session_id);
        if (session.status === 'open') {
          return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      } catch {
        // stale session — fall through and create a fresh one
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Unlock paid message',
            description: (message.content || 'Exclusive photo/video').slice(0, 180),
          },
          unit_amount: amountCents },
        quantity: 1 }],
      success_url: `${origin}/messenger?ppv=success`,
      cancel_url: `${origin}/messenger?ppv=cancel`,
      metadata: {
        type: 'ppv_message_unlock',
        message_id: messageId,
        buyer_id: user.id,
        seller_id: message.sender_id } });

    if (existing) {
      await supabaseAdmin
        .from('message_ppv_unlocks')
        .update({ amount_cents: amountCents, creator_payout_cents: creatorPayoutCents, stripe_session_id: session.id })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('message_ppv_unlocks').insert({
        message_id: messageId,
        buyer_id: user.id,
        seller_id: message.sender_id,
        amount_cents: amountCents,
        creator_payout_cents: creatorPayoutCents,
        status: 'pending',
        stripe_session_id: session.id });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
