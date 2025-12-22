import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-voice-subscription");

const PRICE_IDS = {
  voiceLibrary: "price_1SQD3qGaXSfGtYFtLEOizLmJ",
  unlimitedTTS: "price_1SQD3XGaXSfGtYFtmcOEBBfI",
  aiConversation: "price_1SQD46GaXSfGtYFtqUR0AHDN",
  cloneSetup: "price_1SQD3DGaXSfGtYFtg52PlpKe",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        hasVoiceLibrary: false, hasUnlimitedTTS: false,
        hasAIConversation: false, hasCloneSetup: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId, status: "active", limit: 100,
    });

    let hasVoiceLibrary = false, hasUnlimitedTTS = false, hasAIConversation = false;
    const subscriptionEnds: Record<string, string> = {};

    for (const sub of subscriptions.data) {
      const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        if (priceId === PRICE_IDS.voiceLibrary) {
          hasVoiceLibrary = true;
          subscriptionEnds.voiceLibrary = subscriptionEnd;
        } else if (priceId === PRICE_IDS.unlimitedTTS) {
          hasUnlimitedTTS = true;
          subscriptionEnds.unlimitedTTS = subscriptionEnd;
        } else if (priceId === PRICE_IDS.aiConversation) {
          hasAIConversation = true;
          subscriptionEnds.aiConversation = subscriptionEnd;
        }
      }
    }

    // Check one-time payments (Voice Clone Setup)
    const payments = await stripe.checkout.sessions.list({ customer: customerId, limit: 100 });
    let hasCloneSetup = false;
    for (const session of payments.data) {
      if (session.payment_status === "paid" && session.mode === "payment") {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        for (const item of lineItems.data) {
          if (item.price?.id === PRICE_IDS.cloneSetup) {
            hasCloneSetup = true;
            break;
          }
        }
      }
      if (hasCloneSetup) break;
    }

    return new Response(JSON.stringify({
      hasVoiceLibrary, hasUnlimitedTTS, hasAIConversation, hasCloneSetup, subscriptionEnds
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
