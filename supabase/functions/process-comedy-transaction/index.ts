import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      transactionType, 
      comedianId, 
      amount, 
      relatedId 
    } = await req.json()

    console.log('Processing comedy transaction', { transactionType, comedianId, amount })

    // Calculate platform commission (25%)
    const commissionRate = 25.00
    const platformCommission = amount * (commissionRate / 100)
    const comedianAmount = amount - platformCommission

    // Create earnings record
    const { error: earningsError } = await supabaseAdmin
      .from('comedian_earnings')
      .insert({
        comedian_id: comedianId,
        total_earned: amount,
        commission_rate: commissionRate,
        platform_commission: platformCommission,
        net_amount: comedianAmount,
        source: transactionType
      })

    if (earningsError) throw earningsError

    // Record platform earnings
    const { error: platformError } = await supabaseAdmin
      .from('comedy_platform_earnings')
      .insert({
        comedian_id: comedianId,
        transaction_type: transactionType,
        total_amount: amount,
        comedian_amount: comedianAmount,
        platform_commission: platformCommission,
        commission_rate: commissionRate,
        related_id: relatedId,
        status: 'pending'
      })

    if (platformError) throw platformError

    // Get comedian name for notification
    const { data: comedian } = await supabaseAdmin
      .from('comedian_profiles')
      .select('stage_name')
      .eq('id', comedianId)
      .single()

    // Notify admin about new payout pending
    await supabaseAdmin.functions.invoke('notify-admin-comedy-payout', {
      body: {
        comedianId,
        comedianName: comedian?.stage_name || 'Unknown',
        amount: comedianAmount,
        transactionType
      }
    })

    console.log('Transaction processed successfully')

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing transaction:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
