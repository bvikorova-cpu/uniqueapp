import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(JSON.stringify({ error: 'sessionId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.type !== 'megatalent_tip') {
      return new Response(JSON.stringify({ error: 'Wrong session type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (session.payment_status === 'paid') {
      const { data: updated, error } = await admin
        .from('megatalent_tips')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('stripe_session_id', sessionId)
        .eq('status', 'pending')
        .select('id, amount_cents, creator_amount_cents')
        .maybeSingle();
      if (error) throw error;
      return new Response(JSON.stringify({ verified: true, tip: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ verified: false, payment_status: session.payment_status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[verify-megatalent-tip] error', e);
    return new Response(JSON.stringify({ error: e.message ?? 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
