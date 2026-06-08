import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supaUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supaUser.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action: "pause" | "resume" | "cancel" | "portal" = body.action;
    const donationId: string = body.donationId;
    if (!action || !donationId) {
      return new Response(JSON.stringify({ error: "action and donationId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supaAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: donation, error: dErr } = await supaAdmin
      .from("campaign_donations")
      .select("id, donor_id, stripe_subscription_id, stripe_customer_id, is_monthly")
      .eq("id", donationId)
      .single();

    if (dErr || !donation) {
      return new Response(JSON.stringify({ error: "Donation not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (donation.donor_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!donation.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "No subscription linked" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    let updates: Record<string, unknown> = {};

    if (action === "pause") {
      await stripe.subscriptions.update(donation.stripe_subscription_id, {
        pause_collection: { behavior: "void" },
      });
      updates = { paused_at: new Date().toISOString(), subscription_status: "paused" };
    } else if (action === "resume") {
      await stripe.subscriptions.update(donation.stripe_subscription_id, {
        pause_collection: "",
      } as any);
      updates = { paused_at: null, subscription_status: "active" };
    } else if (action === "cancel") {
      await stripe.subscriptions.cancel(donation.stripe_subscription_id);
      updates = { cancelled_at: new Date().toISOString(), subscription_status: "canceled", is_monthly: false };
    } else if (action === "portal") {
      if (!donation.stripe_customer_id) {
        return new Response(JSON.stringify({ error: "No customer linked" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const origin = req.headers.get("origin") || "https://www.uniqueapp.fun";
      const session = await stripe.billingPortal.sessions.create({
        customer: donation.stripe_customer_id,
        return_url: `${origin}/fundraising/recurring`,
        flow_data: { type: "payment_method_update" } as any,
      });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (Object.keys(updates).length) {
      await supaAdmin.from("campaign_donations").update(updates).eq("id", donationId);
    }

    return new Response(JSON.stringify({ ok: true, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[manage-donation-subscription]", e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
