import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    console.log("Starting job listings expiration notification check...");

    // Calculate date range for 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const threeDaysFromNowEnd = new Date(threeDaysFromNow);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    console.log("Looking for payments expiring between:", threeDaysFromNow.toISOString(), "and", threeDaysFromNowEnd.toISOString());

    // Find payments that expire in ~3 days and haven't been notified yet
    const { data: expiringPayments, error: paymentsError } = await supabaseClient
      .from("job_listing_payments")
      .select(`
        id,
        job_id,
        user_id,
        expires_at,
        duration_days,
        job_listings (
          id,
          title,
          company_name,
          employer_id
        )
      `)
      .eq("status", "completed")
      .gte("expires_at", threeDaysFromNow.toISOString())
      .lte("expires_at", threeDaysFromNowEnd.toISOString())
      .is("expiration_notification_sent_at", null);

    if (paymentsError) {
      console.error("Error fetching expiring payments:", paymentsError);
      throw paymentsError;
    }

    if (!expiringPayments || expiringPayments.length === 0) {
      console.log("No job listings requiring expiration notifications");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No job listings requiring expiration notifications",
          notified_count: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${expiringPayments.length} job listings to notify`);

    const notifications = [];
    const errors = [];

    // Send notifications for each expiring listing
    for (const payment of expiringPayments) {
      try {
        const jobListing = payment.job_listings as any;
        
        // Get employer email
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
          payment.user_id
        );

        if (userError || !userData?.user?.email) {
          console.error(`Could not find user email for payment ${payment.id}:`, userError);
          errors.push({ payment_id: payment.id, error: "User email not found" });
          continue;
        }

        const employerEmail = userData.user.email;
        const expiresAt = new Date(payment.expires_at);
        const formattedDate = expiresAt.toLocaleDateString('sk-SK', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        // Send email via Resend API
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Job Portal <onboarding@resend.dev>",
            to: [employerEmail],
            subject: `Vaša ponuka práce vyprší o 3 dni - ${jobListing.title}`,
            html: `
              <h1>Upozornenie: Ponuka práce čoskoro vyprší</h1>
              <p>Dobrý deň,</p>
              <p>Vaša ponuka práce <strong>${jobListing.title}</strong> v spoločnosti <strong>${jobListing.company_name}</strong> vyprší o 3 dni.</p>
              <p><strong>Dátum vypršania:</strong> ${formattedDate}</p>
              <p>Po vypršaní nebude ponuka viditeľná pre uchádzačov. Ak chcete ponuku predĺžiť, navštívte svoj dashboard a obnovte predplatné.</p>
              <br>
              <p>S pozdravom,<br>Job Portal Team</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Resend API error: ${errorText}`);
        }

        const emailResult = await emailResponse.json();

        console.log(`Email sent to ${employerEmail} for job listing ${jobListing.id}:`, emailResult);

        // Mark notification as sent
        const { error: updateError } = await supabaseClient
          .from("job_listing_payments")
          .update({ expiration_notification_sent_at: new Date().toISOString() })
          .eq("id", payment.id);

        if (updateError) {
          console.error(`Error updating notification status for payment ${payment.id}:`, updateError);
          errors.push({ payment_id: payment.id, error: updateError.message });
        } else {
          notifications.push({
            payment_id: payment.id,
            job_id: jobListing.id,
            email: employerEmail,
            expires_at: payment.expires_at
          });
        }
      } catch (emailError) {
        console.error(`Error sending notification for payment ${payment.id}:`, emailError);
        errors.push({ 
          payment_id: payment.id, 
          error: emailError instanceof Error ? emailError.message : "Unknown error" 
        });
      }
    }

    console.log(`Successfully sent ${notifications.length} notifications`);
    if (errors.length > 0) {
      console.log(`Encountered ${errors.length} errors:`, errors);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${notifications.length} expiration notifications`,
        notified_count: notifications.length,
        notifications,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Notify expiring job listings error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
