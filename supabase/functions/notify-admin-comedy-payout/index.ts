import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { comedianId, comedianName, amount, transactionType } = await req.json()

    console.log('Creating admin notification for comedy payout', { comedianId, comedianName, amount })

    // Get all admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (adminError) throw adminError

    // Create notification for each admin
    const notifications = adminUsers.map(admin => ({
      user_id: admin.user_id,
      type: 'comedy_payout',
      title: 'New Comedy Club Payout Pending',
      message: `€${amount.toFixed(2)} ready to pay to ${comedianName} (${transactionType})`,
      related_id: comedianId,
      is_read: false
    }))

    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)

    if (notifError) throw notifError

    console.log(`Created ${notifications.length} admin notifications`)

    return new Response(
      JSON.stringify({ success: true, notificationsCreated: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error creating admin notification:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
