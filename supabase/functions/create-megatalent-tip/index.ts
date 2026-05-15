import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const PLATFORM_FEE_BPS = 2000; // 20%

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabaseAuth.auth.getUser();
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { creatorId, amountCents, message, categorySlug } = body ?? {};
    if (!creatorId || typeof creatorId !== 'string') {
      return new Response(JSON.stringify({ error: 'creatorId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (creatorId === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot tip yourself' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const amt = Number(amountCents);
    if (!Number.isFinite(amt) || amt < 100 || amt > 50000) {
      return new Response(JSON.stringify({ error: 'amountCents must be 100..50000' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const safeMessage = typeof message === 'string' ? message.slice(0, 280) : null;

    const platformFee = Math.round((amt * PLATFORM_FEE_BPS) / 10000);
    const creatorAmount = amt - platformFee;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    });
    const origin = req.headers.get('origin') ?? 'https://uniqueapp.fun';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Megatalent Tip',
            description: safeMessage ?? `Support for talent ${creatorId.slice(0, 8)}`,
          },
          unit_amount: amt,
        },
        quantity: 1,
      }],
      success_url: `${origin}/megatalent?tip=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/megatalent?tip=cancel`,
      metadata: {
        type: 'megatalent_tip',
        creatorId,
        tipperId: user.id,
        categorySlug: categorySlug ?? '',
      },
    });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { error: insertErr } = await supabaseAdmin.from('megatalent_tips').insert({
      creator_id: creatorId,
      tipper_id: user.id,
      category_slug: categorySlug ?? null,
      amount_cents: amt,
      platform_fee_cents: platformFee,
      creator_amount_cents: creatorAmount,
      message: safeMessage,
      stripe_session_id: session.id,
      status: 'pending',
    });
    if (insertErr) {
      console.error('[create-megatalent-tip] insert error', insertErr);
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[create-megatalent-tip] error', e);
    return new Response(JSON.stringify({ error: e.message ?? 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
