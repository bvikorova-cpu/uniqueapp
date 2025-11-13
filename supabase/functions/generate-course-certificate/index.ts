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

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Unauthorized");

    const { courseId, enrollmentId } = await req.json();
    
    if (!courseId || !enrollmentId) {
      throw new Error("Missing courseId or enrollmentId");
    }

    // Use service role for DB operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if course is completed
    const { data: enrollment, error: enrollmentError } = await supabaseClient
      .from("user_course_enrollments")
      .select("progress_percentage, completed_at")
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (enrollmentError) throw enrollmentError;

    if (enrollment.progress_percentage !== 100 || !enrollment.completed_at) {
      throw new Error("Course not completed yet");
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabaseClient
      .from("course_certificates")
      .select("id, certificate_number")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (existingCert) {
      return new Response(
        JSON.stringify({ 
          certificateNumber: existingCert.certificate_number,
          alreadyIssued: true 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate certificate number
    const certNumber = `CERT-PC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create certificate
    const { data: certificate, error: certError } = await supabaseClient
      .from("course_certificates")
      .insert({
        user_id: user.id,
        course_id: courseId,
        enrollment_id: enrollmentId,
        certificate_number: certNumber,
      })
      .select()
      .single();

    if (certError) throw certError;

    return new Response(
      JSON.stringify({ 
        certificateNumber: certNumber,
        issuedAt: certificate.issued_at 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
