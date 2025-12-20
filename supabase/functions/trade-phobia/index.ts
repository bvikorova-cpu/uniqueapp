import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { action, phobiaId, price, tradeId } = await req.json()

    if (action === 'list') {
      // List phobia for sale
      if (!phobiaId || !price) {
        throw new Error('Phobia ID and price are required')
      }

      const { data: phobia, error: phobiaError } = await supabaseClient
        .from('user_phobias')
        .select('*')
        .eq('id', phobiaId)
        .eq('user_id', user.id)
        .single()

      if (phobiaError || !phobia) throw new Error('Phobia not found')

      const { error: insertError } = await supabaseClient
        .from('phobia_trades')
        .insert({
          seller_id: user.id,
          phobia_id: phobiaId,
          price: price,
          status: 'listed',
        })

      if (insertError) throw insertError

      return new Response(
        JSON.stringify({ success: true, message: 'Phobia listed for trade' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'buy') {
      // Buy a listed phobia
      if (!tradeId) {
        throw new Error('Trade ID is required')
      }

      const { data: trade, error: tradeError } = await supabaseClient
        .from('phobia_trades')
        .select('*, user_phobias(*)')
        .eq('id', tradeId)
        .eq('status', 'listed')
        .single()

      if (tradeError || !trade) throw new Error('Trade not found')

      // Update trade status
      const { error: updateError } = await supabaseClient
        .from('phobia_trades')
        .update({
          buyer_id: user.id,
          status: 'completed',
          transaction_date: new Date().toISOString(),
        })
        .eq('id', tradeId)

      if (updateError) throw updateError

      // Transfer phobia to buyer
      const { error: transferError } = await supabaseClient
        .from('user_phobias')
        .insert({
          user_id: user.id,
          phobia_name: trade.user_phobias.phobia_name,
          phobia_type: trade.user_phobias.phobia_type,
          severity: trade.user_phobias.severity,
          description: trade.user_phobias.description,
          ai_analysis: trade.user_phobias.ai_analysis,
          source: 'traded',
          status: 'active',
        })

      if (transferError) throw transferError

      return new Response(
        JSON.stringify({ success: true, message: 'Phobia purchased successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'get_marketplace') {
      // Get all listed phobias
      const { data: trades, error: tradesError } = await supabaseClient
        .from('phobia_trades')
        .select('*, user_phobias(*)')
        .eq('status', 'listed')
        .order('created_at', { ascending: false })

      if (tradesError) throw tradesError

      return new Response(
        JSON.stringify({ success: true, trades }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in trade-phobia:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
