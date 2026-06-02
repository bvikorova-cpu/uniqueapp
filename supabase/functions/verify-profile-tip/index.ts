// Verifies a Stripe Checkout session for a profile tip and marks it completed.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') return j({ error: 'sessionId required' }, 400);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    if (session.metadata?.type !== 'profile_tip') return j({ error: 'Wrong session type' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (session.payment_status === 'paid') {
      const pi = typeof session.payment_intent === 'object' ? session.payment_intent : null;
      const transferId = pi && (pi as any).transfer_data?.destination ? ((pi as any).latest_charge ?? null) : null;
      const { data: updated, error } = await admin
        .from('profile_tips')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : pi?.id ?? null,
          stripe_transfer_id: transferId,
        })
        .eq('stripe_session_id', sessionId)
        .eq('status', 'pending')
        .select('id, amount_cents, recipient_amount_cents, recipient_id')
        .maybeSingle();
      if (error) throw error;
      return j({ verified: true, tip: updated });
    }

    return j({ verified: false, payment_status: session.payment_status });
  } catch (e: any) {
    console.error('[verify-profile-tip]', e);
    return j({ error: e.message ?? 'Unknown error' }, 500);
  }
});
