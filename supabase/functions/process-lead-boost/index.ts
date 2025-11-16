import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { propertyId, purchaseId } = await req.json();

    // Get property details
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error('Property not found');
    }

    // Update purchase status to processing
    await supabaseClient
      .from('property_lead_boost_purchases')
      .update({ status: 'processing' })
      .eq('id', purchaseId);

    console.log(`Starting lead boost campaign for property: ${property.title}`);
    
    // Simulate email campaign (in production, integrate with email service like SendGrid, Mailchimp, etc.)
    // Here we're simulating sending to 1000+ potential buyers
    const targetEmails = 1000;
    const batchSize = 100;
    let emailsSent = 0;

    for (let i = 0; i < targetEmails; i += batchSize) {
      // Simulate batch email sending
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const batchCount = Math.min(batchSize, targetEmails - i);
      emailsSent += batchCount;

      // Update progress
      await supabaseClient
        .from('property_lead_boost_purchases')
        .update({ 
          emails_sent: emailsSent,
          status: emailsSent >= targetEmails ? 'completed' : 'processing',
          completed_at: emailsSent >= targetEmails ? new Date().toISOString() : null
        })
        .eq('id', purchaseId);

      console.log(`Lead boost progress: ${emailsSent}/${targetEmails} emails sent`);
    }

    console.log(`Lead boost campaign completed for property: ${property.title}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead boost campaign completed successfully',
        emailsSent 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing lead boost:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});