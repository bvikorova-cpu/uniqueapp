import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const logStep = (step: string, details?: any) => {
  console.log(`[APPROVE-APPLICATION] ${step}`, details || "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Only admins can approve applications");
    }

    const { applicationId, action, rejectionReason } = await req.json();
    
    if (!applicationId || !action) {
      throw new Error("Missing required fields");
    }

    if (!["approve", "reject"].includes(action)) {
      throw new Error("Invalid action. Must be 'approve' or 'reject'");
    }

    logStep("Processing application", { applicationId, action });

    // Get application details
    const { data: application, error: appError } = await supabaseAdmin
      .from("campaign_applications")
      .select(`
        *,
        brand_campaigns (
          user_id,
          brand_name,
          campaign_name
        ),
        virtual_influencers (
          user_id,
          name
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Update application status
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { error: updateError } = await supabaseAdmin
      .from("campaign_applications")
      .update({ status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: action === "reject" ? rejectionReason : null,
        updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (updateError) {
      throw new Error(`Failed to update application: ${updateError.message}`);
    }

    logStep("Application updated", { newStatus });

    // Send notification to influencer
    const notificationMessage = action === "approve"
      ? `Your application for campaign "${application.brand_campaigns.campaign_name}" has been approved! The brand can now proceed with payment.`
      : `Your application for campaign "${application.brand_campaigns.campaign_name}" has been rejected. ${rejectionReason || ""}`;

    await supabaseAdmin.from("notifications").insert({ user_id: application.virtual_influencers.user_id,
      type: action === "approve" ? "campaign_approved" : "campaign_rejected",
      title: action === "approve" ? "Campaign Application Approved" : "Campaign Application Rejected",
      message: notificationMessage });

    // Send notification to brand
    await supabaseAdmin.from("notifications").insert({
      user_id: application.brand_campaigns.user_id,
      type: "campaign_application_reviewed",
      title: "Application Reviewed",
      message: `The application from ${application.virtual_influencers.name} for your campaign "${application.brand_campaigns.campaign_name}" has been ${newStatus}.` });

    logStep("Notifications sent");

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: newStatus,
        message: `Application ${newStatus} successfully` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});