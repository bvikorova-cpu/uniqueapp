import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PayoutResult {
  batch_id: string;
  processed: number;
  failed: number;
  total: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled payout processing...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Check if today is a payout date (1st or 15th)
    if (dayOfMonth !== 1 && dayOfMonth !== 15) {
      console.log(`Today is not a payout date (day ${dayOfMonth}). Skipping.`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Not a payout date',
          date: today.toISOString().split('T')[0],
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Processing payouts for ${today.toISOString().split('T')[0]}`);

    // Create payout batch for today
    const { data: batchId, error: batchError } = await supabase.rpc(
      'create_payout_batch',
      { p_batch_date: today.toISOString().split('T')[0] }
    );

    if (batchError) {
      console.error('Error creating payout batch:', batchError);
      throw batchError;
    }

    console.log(`Created batch: ${batchId}`);

    // Check if there are any withdrawals to process
    const { data: batchInfo, error: batchInfoError } = await supabase
      .from('payout_batches')
      .select('total_requests, total_amount')
      .eq('id', batchId)
      .single();

    if (batchInfoError) {
      console.error('Error fetching batch info:', batchInfoError);
      throw batchInfoError;
    }

    if (!batchInfo || batchInfo.total_requests === 0) {
      console.log('No pending withdrawals to process');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending withdrawals',
          batch_id: batchId,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Processing ${batchInfo.total_requests} withdrawals totaling ${batchInfo.total_amount}`);

    // Process the batch
    const { data: result, error: processError } = await supabase.rpc(
      'process_scheduled_payouts',
      { p_batch_id: batchId }
    ) as { data: PayoutResult | null; error: any };

    if (processError) {
      console.error('Error processing payouts:', processError);
      
      // Mark batch as failed
      await supabase
        .from('payout_batches')
        .update({
          status: 'failed',
          error_message: processError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', batchId);

      throw processError;
    }

    console.log('Payout processing completed:', result);

    // Send notification to admins about completed batch
    // This could be extended to send emails
    const response = {
      success: true,
      message: 'Payouts processed successfully',
      batch_id: batchId,
      processed: result?.processed || 0,
      failed: result?.failed || 0,
      total: result?.total || 0,
      date: today.toISOString().split('T')[0],
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in scheduled payout processing:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process scheduled payouts',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
