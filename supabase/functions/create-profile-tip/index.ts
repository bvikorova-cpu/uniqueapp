// Profile Tip — creates Stripe Checkout session. Uses Stripe Connect destination
// charges when the recipient has completed onboarding; otherwise platform keeps funds.
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/src/lib/constants';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@17?target=deno';

const MIN_CENTS = 100;       // €1
const MAX_CENTS = 10_000;    // €100
const PLATFORM_FEE_BPS = 1000; // 10%

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return j({ error: 'Unauthorized' }, 401);

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabaseAuth.auth.getUser();
    const user = userData.user;
    if (!user) return j({ error: 'Unauthorized' }, 401);

    const { recipientId, amountCents, message } = await req.json();
    if (!recipientId || typeof recipientId !== 'string') return j({ error: 'recipientId required' }, 400);
    if (recipientId === user.id) return j({ error: 'Cannot tip yourself' }, 400);

    const amt = Number(amountCents);
    if (!Number.isFinite(amt) || amt < MIN_CENTS || amt > MAX_CENTS) {
      return j({ error: `Amount must be between €${MIN_CENTS / 100} and €${MAX_CENTS / 100}` }, 400);
    }
    const safeMessage = typeof message === 'string' ? message.slice(0, 280) : null;

    const platformFee = Math.round((amt * PLATFORM_FEE_BPS) / 10000);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: recipient } = await admin
      .from('profiles')
      .select('id, full_name, username, stripe_connect_account_id, stripe_connect_charges_enabled')
      .eq('id', recipientId)
      .maybeSingle();
    if (!recipient) return j({ error: 'Recipient not found' }, 404);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20',
    });
    const origin = req.headers.get('origin') ?? 'https://uniqueapp.fun';

    const useConnect = !!(recipient.stripe_connect_account_id && recipient.stripe_connect_charges_enabled);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Tip for ${recipient.full_name ?? recipient.username ?? 'creator'}`,
            description: safeMessage ?? 'Profile tip',
          },
          unit_amount: amt,
        },
        quantity: 1,
      }],
      success_url: `${origin}/profile/${recipientId}?tip=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/profile/${recipientId}?tip=cancel`,
      metadata: {
        type: 'profile_tip',
        recipientId,
        senderId: user.id,
      },
    };

    if (useConnect) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: { destination: recipient.stripe_connect_account_id! },
        description: `Tip from ${user.email ?? user.id} → ${recipientId}`,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    const { error: insertErr } = await admin.from('profile_tips').insert({
      sender_id: user.id,
      recipient_id: recipientId,
      amount_cents: amt,
      platform_fee_cents: platformFee,
      recipient_amount_cents: amt - platformFee,
      message: safeMessage,
      stripe_session_id: session.id,
      destination_account_id: useConnect ? recipient.stripe_connect_account_id : null,
      status: 'pending',
      currency: 'eur',
    });
    if (insertErr) console.error('[create-profile-tip] insert error', insertErr);

    return j({
      url: session.url,
      sessionId: session.id,
      connectEnabled: useConnect,
    });
  } catch (e: any) {
    console.error('[create-profile-tip]', e);
    return j({ error: e.message ?? 'Unknown error' }, 500);
  }
});
