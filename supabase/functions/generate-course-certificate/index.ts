import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { courseId, courseName, studentName } = await req.json();

    if (!courseId || !courseName || !studentName) {
      throw new Error("Missing required fields");
    }

    // Generate certificate HTML
    const certificateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { size: landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .certificate {
            background: white;
            width: 800px;
            padding: 60px;
            border: 20px solid #f0f0f0;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            text-align: center;
          }
          .certificate-header {
            font-size: 48px;
            color: #667eea;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 4px;
          }
          .certificate-subheader {
            font-size: 18px;
            color: #666;
            margin-bottom: 40px;
          }
          .student-name {
            font-size: 42px;
            color: #333;
            margin: 30px 0;
            font-weight: bold;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            display: inline-block;
          }
          .course-name {
            font-size: 24px;
            color: #764ba2;
            margin: 30px 0;
            font-style: italic;
          }
          .completion-text {
            font-size: 16px;
            color: #666;
            margin: 20px 0;
          }
          .date {
            font-size: 14px;
            color: #999;
            margin-top: 40px;
          }
          .seal {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-header">Certificate of Completion</div>
          <div class="certificate-subheader">This is to certify that</div>
          <div class="student-name">${studentName}</div>
          <div class="completion-text">has successfully completed the course</div>
          <div class="course-name">"${courseName}"</div>
          <div class="completion-text">demonstrating dedication and mastery of the subject matter</div>
          <div class="date">Issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="seal">✓</div>
        </div>
      </body>
      </html>
    `;

    // For now, we'll store the HTML directly. In production, you'd use a PDF generation service
    // or library like Puppeteer/Playwright
    const certificateData = {
      course_id: courseId,
      user_id: user.id,
      student_name: studentName,
      certificate_url: null, // In production, this would be a PDF URL
      issued_at: new Date().toISOString(),
    };

    const { data: certificate, error: certError } = await supabaseClient
      .from("course_certificates")
      .upsert(certificateData, { onConflict: 'course_id,user_id' })
      .select()
      .single();

    if (certError) {
      throw certError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificate,
        certificateHtml // Return HTML for frontend display
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating certificate:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
