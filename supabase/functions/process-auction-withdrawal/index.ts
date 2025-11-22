import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Process auction withdrawal function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Verify admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      throw new Error('Admin access required')
    }

    const { withdrawalId, action, adminNotes, stripePayoutId } = await req.json()

    console.log('Processing withdrawal request:', { withdrawalId, action })

    // Get withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('auction_withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single()

    if (withdrawalError || !withdrawal) {
      throw new Error('Withdrawal request not found')
    }

    if (withdrawal.status !== 'pending' && withdrawal.status !== 'approved') {
      throw new Error('Withdrawal request cannot be processed')
    }

    let updateData: any = {
      admin_notes: adminNotes,
      processed_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.status = 'approved'
    } else if (action === 'complete') {
      updateData.status = 'completed'
      updateData.stripe_payout_id = stripePayoutId
    } else if (action === 'reject') {
      updateData.status = 'rejected'
    }

    // Update withdrawal request
    const { error: updateError } = await supabaseAdmin
      .from('auction_withdrawal_requests')
      .update(updateData)
      .eq('id', withdrawalId)

    if (updateError) {
      throw updateError
    }

    // Create notification for seller
    const notificationMessage = 
      action === 'approve' ? 'Your withdrawal request has been approved and is being processed.' :
      action === 'complete' ? 'Your withdrawal has been completed.' :
      'Your withdrawal request has been rejected.'

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: withdrawal.seller_id,
        type: 'auction_withdrawal',
        title: `Withdrawal ${action === 'complete' ? 'Completed' : action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: notificationMessage,
        related_id: withdrawalId
      })

    console.log('Withdrawal request processed successfully')

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
