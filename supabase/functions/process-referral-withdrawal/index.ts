import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId, action, adminNotes } = await req.json();

    if (!requestId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing requestId or action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the withdrawal request
    const { data: request, error: fetchError } = await supabaseClient
      .from('referral_withdrawal_requests')
      .select('*, profiles(full_name)')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return new Response(
        JSON.stringify({ error: 'Withdrawal request not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    let updateData: any = { admin_notes: adminNotes };

    if (action === 'approve') {
      updateData.status = 'approved';
    } else if (action === 'complete') {
      updateData.status = 'completed';
      updateData.processed_at = new Date().toISOString();

      // Mark earnings as paid
      const { error: updateError } = await supabaseClient
        .from('megatalent_referral_earnings')
        .update({ paid: true })
        .eq('referrer_id', request.referrer_id)
        .eq('paid', false);

      if (updateError) {
        console.error('Error updating earnings:', updateError);
      }
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.processed_at = new Date().toISOString();
    }

    // Update the request
    const { error: updateError } = await supabaseClient
      .from('referral_withdrawal_requests')
      .update(updateData)
      .eq('id', requestId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create notification for the referrer
    const notificationTitle = 
      action === 'approve' ? 'Withdrawal Request Approved' :
      action === 'complete' ? 'Withdrawal Completed' :
      'Withdrawal Request Rejected';

    const notificationMessage = 
      action === 'approve' ? `Your referral withdrawal request for €${request.amount} has been approved and will be processed soon.` :
      action === 'complete' ? `Your referral withdrawal of €${request.amount} has been completed.` :
      `Your referral withdrawal request for €${request.amount} has been rejected. ${adminNotes || ''}`;

    await supabaseClient.from('notifications').insert({
      user_id: request.referrer_id,
      title: notificationTitle,
      message: notificationMessage,
      type: 'withdrawal',
      read: false
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});