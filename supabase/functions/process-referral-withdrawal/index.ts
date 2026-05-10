import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );

    // ── AUTH: must be admin ────────────────────────────────────────
    const auth = req.headers.get('Authorization');
    if (!auth) return json({ error: 'Missing auth' }, 401);
    const token = auth.replace('Bearer ', '');
    const { data: u } = await supabase.auth.getUser(token);
    const caller = u.user;
    if (!caller) return json({ error: 'Not authenticated' }, 401);

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: caller.id,
      _role: 'admin',
    });
    if (!isAdmin) return json({ error: 'Forbidden: admin only' }, 403);

    // ── INPUT ──────────────────────────────────────────────────────
    const { requestId, action, adminNotes } = await req.json().catch(() => ({}));
    if (!requestId || !action) return json({ error: 'Missing requestId or action' }, 400);
    if (!['approve', 'complete', 'reject'].includes(action)) {
      return json({ error: 'Invalid action' }, 400);
    }

    const { data: request, error: fetchError } = await supabase
      .from('referral_withdrawal_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    if (fetchError || !request) return json({ error: 'Withdrawal request not found' }, 404);

    const updateData: Record<string, any> = { admin_notes: adminNotes ?? null };

    if (action === 'approve') {
      updateData.status = 'approved';
    } else if (action === 'complete') {
      updateData.status = 'completed';
      updateData.processed_at = new Date().toISOString();

      // Mark earnings as paid up to the withdrawn amount only (FIFO oldest-first)
      const { data: unpaid } = await supabase
        .from('megatalent_referral_earnings')
        .select('id, amount')
        .eq('referrer_id', request.referrer_id)
        .eq('paid', false)
        .order('created_at', { ascending: true });

      let remaining = Number(request.amount);
      const idsToMark: string[] = [];
      for (const row of unpaid || []) {
        if (remaining <= 0) break;
        idsToMark.push(row.id);
        remaining -= Number(row.amount);
      }
      if (idsToMark.length > 0) {
        const { error: payErr } = await supabase
          .from('megatalent_referral_earnings')
          .update({ paid: true })
          .in('id', idsToMark);
        if (payErr) console.error('mark paid failed', payErr);
      }
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.processed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('referral_withdrawal_requests')
      .update(updateData)
      .eq('id', requestId);
    if (updateError) return json({ error: updateError.message }, 500);

    const notificationTitle =
      action === 'approve' ? 'Withdrawal Request Approved' :
      action === 'complete' ? 'Withdrawal Completed' :
      'Withdrawal Request Rejected';

    const notificationMessage =
      action === 'approve' ? `Your referral withdrawal request for €${request.amount} has been approved and will be processed soon.` :
      action === 'complete' ? `Your referral withdrawal of €${request.amount} has been completed.` :
      `Your referral withdrawal request for €${request.amount} has been rejected. ${adminNotes || ''}`;

    await supabase.from('notifications').insert({
      user_id: request.referrer_id,
      title: notificationTitle,
      message: notificationMessage,
      type: 'withdrawal',
      is_read: false,
    });

    await supabase.from('admin_audit_log').insert({
      admin_id: caller.id,
      action: `referral_withdrawal_${action}`,
      target_type: 'referral_withdrawal_requests',
      target_id: requestId,
      details: { amount: request.amount, referrer_id: request.referrer_id, notes: adminNotes },
    });

    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
