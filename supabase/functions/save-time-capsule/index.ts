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
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const {
      title,
      message,
      capsuleType,
      deliveryDate,
      recipientEmail,
      recipientName,
      durationYears,
      pricePaid,
      stripePaymentId,
      files,
    } = await req.json();

    if (!title || !deliveryDate || !durationYears) {
      throw new Error("Title, delivery date, and duration are required");
    }

    // Create time capsule
    const { data: capsule, error: capsuleError } = await supabaseClient
      .from("time_capsules")
      .insert({
        user_id: user.id,
        title,
        message,
        capsule_type: capsuleType || 'text',
        delivery_date: deliveryDate,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        duration_years: durationYears,
        price_paid: pricePaid,
        payment_status: stripePaymentId ? 'paid' : 'pending',
        stripe_payment_id: stripePaymentId,
      })
      .select()
      .single();

    if (capsuleError) throw capsuleError;

    // Save files if any
    if (files && files.length > 0) {
      const fileRecords = files.map((file: any) => ({
        capsule_id: capsule.id,
        file_url: file.url,
        file_type: file.type,
        file_size: file.size,
      }));

      const { error: filesError } = await supabaseClient
        .from("time_capsule_files")
        .insert(fileRecords);

      if (filesError) throw filesError;
    }

    // Update subscription capsule count if premium user
    const { data: subscription } = await supabaseClient
      .from("time_capsule_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subscription && subscription.status === 'active') {
      await supabaseClient
        .from("time_capsule_subscriptions")
        .update({ capsules_created: subscription.capsules_created + 1 })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      capsule_id: capsule.id,
      message: "Time capsule created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Save time capsule error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
