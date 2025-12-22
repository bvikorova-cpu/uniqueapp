import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { contentId, contentType, title, instructorName, completionScore } = await req.json();

    // Check if content is completed
    const { data: progress } = await supabaseClient
      .from('learning_progress')
      .select('progress_percentage, completed_at')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .maybeSingle();

    if (!progress || progress.progress_percentage < 100) {
      return new Response(
        JSON.stringify({ error: "Content not completed yet" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if certificate already exists
    const { data: existing } = await supabaseClient
      .from('learning_certificates')
      .select('id, certificate_url, certificate_number')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          certificate: existing 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate certificate number
    const { data: certNumber } = await supabaseClient
      .rpc('generate_certificate_number');

    // Get user profile for certificate
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    const userName = profile?.full_name || profile?.email || 'Student';

    // Create certificate record
    const { data: certificate, error: certError } = await supabaseClient
      .from('learning_certificates')
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        title,
        certificate_number: certNumber,
        instructor_name: instructorName,
        completion_score: completionScore || null,
      })
      .select()
      .single();

    if (certError) throw certError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificate: {
          ...certificate,
          user_name: userName
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating certificate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});