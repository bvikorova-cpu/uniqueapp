import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';
import { z } from 'npm:zod@3';

const Body = z.object({
  amount_cents: z.number().int().min(100).max(100000),
  salon_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  description: z.string().max(200).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { amount_cents, salon_id, booking_id, description } = parsed.data;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-11-20.acacia' as any });
    const origin = req.headers.get('origin') ?? 'https://uniqueapp.fun';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: amount_cents,
          product_data: { name: description ?? 'Spa/Salon záloha' },
        },
        quantity: 1,
      }],
      success_url: `${origin}/spa?deposit=success`,
      cancel_url: `${origin}/spa?deposit=cancel`,
      metadata: { user_id: user.id, salon_id: salon_id ?? '', booking_id: booking_id ?? '', kind: 'spa_deposit' },
    });

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.from('spa_deposits').insert({
      user_id: user.id,
      salon_id: salon_id ?? null,
      booking_id: booking_id ?? null,
      amount_cents,
      currency: 'eur',
      stripe_session_id: session.id,
      status: 'pending',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
