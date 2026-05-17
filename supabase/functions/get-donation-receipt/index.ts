import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReceiptPayload {
  donationId?: string;
  sessionId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { donationId, sessionId } = (await req.json()) as ReceiptPayload;

    let donation: any = null;

    if (donationId) {
      const { data } = await supabase
        .from("campaign_donations")
        .select("*")
        .eq("id", donationId)
        .maybeSingle();
      donation = data;
    }

    if (!donation && sessionId) {
      // Resolve Stripe session → payment_intent → match donation
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const pi =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;
        if (pi) {
          const { data } = await supabase
            .from("campaign_donations")
            .select("*")
            .eq("stripe_payment_id", pi)
            .maybeSingle();
          donation = data;
        }
      }
    }

    if (!donation) {
      return new Response(
        JSON.stringify({ error: "Donation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch campaign title (best-effort across all 8 fundraising tables)
    const tableMap: Record<string, string> = {
      medical: "medical_campaigns",
      dream: "dream_campaigns",
      hero: "hero_campaigns",
      pet: "pet_campaigns",
      student: "student_campaigns",
      crisis: "crisis_campaigns",
      talent: "talent_campaigns",
    };
    const table = tableMap[donation.campaign_type];
    let campaignTitle = "Campaign";
    let beneficiary = "";
    if (table) {
      const { data: campaign } = await supabase
        .from(table)
        .select("title, patient_name, beneficiary_name, recipient_name")
        .eq("id", donation.campaign_id)
        .maybeSingle();
      if (campaign) {
        campaignTitle = (campaign as any).title || campaignTitle;
        beneficiary =
          (campaign as any).patient_name ||
          (campaign as any).beneficiary_name ||
          (campaign as any).recipient_name ||
          "";
      }
    }

    const receiptNumber = `UNQ-${new Date(donation.created_at)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${donation.id.slice(0, 8).toUpperCase()}`;

    const receipt = {
      receipt_number: receiptNumber,
      issued_at: new Date().toISOString(),
      donation_id: donation.id,
      donation_date: donation.created_at,
      amount: Number(donation.amount),
      platform_fee: Number(donation.platform_fee ?? 0),
      net_amount: Number(donation.net_amount ?? donation.amount),
      currency: "EUR",
      donor_name: donation.is_anonymous ? "Anonymous Donor" : donation.donor_name,
      donor_email: donation.donor_email,
      campaign_id: donation.campaign_id,
      campaign_type: donation.campaign_type,
      campaign_title: campaignTitle,
      beneficiary,
      is_monthly: donation.is_monthly,
      payment_status: donation.status,
      tax_deductible_note:
        "This receipt confirms a charitable contribution made via Unique Fundraising. Tax deductibility depends on your country of residence and the registered status of the campaign beneficiary. Consult a tax advisor for guidance.",
      issuer: {
        name: "Unique Platform",
        legal_entity: "Unique s.r.o.",
        website: "https://uniqueapp.fun",
      },
    };

    return new Response(JSON.stringify({ receipt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[get-donation-receipt] ERROR", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
