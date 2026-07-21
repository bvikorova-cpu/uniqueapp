import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(url, svc);
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { submission_id, decision } = body as { submission_id?: string; decision?: 'approved' | 'rejected' };
    if (!submission_id || !['approved', 'rejected'].includes(decision ?? '')) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sub, error: subErr } = await admin
      .from('influking_challenge_submissions')
      .select('id, user_id, challenge_id, status')
      .eq('id', submission_id).maybeSingle();
    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (sub.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Already reviewed' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let granted = 0;
    if (decision === 'approved') {
      const { data: ch } = await admin
        .from('influking_weekly_challenges')
        .select('reward_credits').eq('id', sub.challenge_id).maybeSingle();
      granted = ch?.reward_credits ?? 0;

      if (granted > 0) {
        const { data: wallet } = await admin
          .from('ai_credits').select('id, credits_remaining, total_credits_purchased')
          .eq('user_id', sub.user_id).maybeSingle();

        if (wallet) {
          await admin.from('ai_credits').update({
            credits_remaining: wallet.credits_remaining + granted,
            total_credits_purchased: wallet.total_credits_purchased + granted,
            updated_at: new Date().toISOString(),
          }).eq('id', wallet.id);
        } else {
          await admin.from('ai_credits').insert({
            user_id: sub.user_id,
            credits_remaining: granted,
            total_credits_purchased: granted,
          });
        }

        await admin.from('ai_credits_ledger').insert({
          user_id: sub.user_id,
          delta: granted,
          reason: 'influking_challenge_reward',
          metadata: { submission_id, challenge_id: sub.challenge_id },
        }).then(() => {}, () => {}); // ledger optional
      }
    }

    await admin.from('influking_challenge_submissions').update({
      status: decision === 'approved' ? 'paid' : 'rejected',
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
      reward_credits_granted: granted,
    }).eq('id', submission_id);

    return new Response(JSON.stringify({ ok: true, granted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
