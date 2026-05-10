import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const { requestId, referrerName, amount } = await req.json();

    // Get all admin users from user_roles (roles live in user_roles, not profiles)
    const { data: admins, error: adminsError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminsError || !admins || admins.length === 0) {
      console.error('No admins found or error fetching admins:', adminsError);
      return new Response(
        JSON.stringify({ error: 'No admins found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create notification for each admin
    const notifications = admins.map((a: any) => ({
      user_id: a.user_id,
      title: 'New Referral Withdrawal Request',
      message: `${referrerName} has requested a withdrawal of €${amount} from referral earnings.`,
      type: 'admin_withdrawal',
      is_read: false,
    }));

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      return new Response(
        JSON.stringify({ error: notificationError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

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