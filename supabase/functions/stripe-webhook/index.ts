import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifyAndProcessPayment } from "../_shared/paymentVerification.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const log = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body, signature, webhookSecret, undefined, cryptoProvider
    );

    log("Event received", { type: event.type });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata || {};
      const sid = session.id;
      const paid = session.payment_status === "paid";
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      const paymentType = meta.type || meta.credit_type || "";

      log("Processing", { sid, paid, paymentType, amount });

      if (!paid) {
        log("Not paid, skipping");
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      // Record in transactions audit trail
      const recordTransaction = async (type: string, userId: string, sellerId?: string, commRate = 0.20) => {
        const commission = amount * commRate;
        const sellerAmount = amount - commission;
        await supabase.from("transactions").insert({
          user_id: userId,
          transaction_type: type,
          amount,
          commission_rate: commRate,
          commission_amount: commission,
          seller_amount: sellerAmount,
          status: "completed",
          item_type: type,
          stripe_session_id: sid,
          seller_id: sellerId || null,
        }).then(r => { if (r.error) log("Transaction insert error", r.error); });
      };

      // Upsert credits helper
      const upsertCredits = async (table: string, userId: string, credits: number) => {
        const { data: existing } = await supabase.from(table).select("id, credits_remaining, total_credits_purchased").eq("user_id", userId).maybeSingle();
        if (existing) {
          await supabase.from(table).update({
            credits_remaining: (existing.credits_remaining || 0) + credits,
            total_credits_purchased: (existing.total_credits_purchased || 0) + credits,
            updated_at: new Date().toISOString(),
          }).eq("id", existing.id);
        } else {
          await supabase.from(table).insert({
            user_id: userId,
            credits_remaining: credits,
            total_credits_purchased: credits,
          });
        }
        log(`Credits added to ${table}`, { userId, credits });
      };

      // Handle credit purchases via centralized verification
      const credits = parseInt(meta.credits || "0");
      if (credits > 0 && paymentType) {
        const result = await verifyAndProcessPayment(supabase, sid);
        if (result.success) {
          log("Credit purchase processed", { credits: result.credits, alreadyProcessed: result.alreadyProcessed });
        } else {
          log("Credit purchase failed", { error: result.error });
        }
      }

      // ============================================
      // CONCERT SECTION
      // ============================================

      if (paymentType === "concert_ticket") {
        log("Processing concert ticket");
        const musicianAmount = amount * 0.80;
        const platformComm = amount * 0.20;
        
        await supabase.from("concert_ticket_purchases").insert({
          user_id: meta.user_id, concert_id: meta.concert_id,
          ticket_type_id: meta.ticket_type_id, amount_paid: amount,
          payment_status: "completed", stripe_session_id: sid,
        });
        await supabase.from("musician_earnings").insert({
          musician_id: meta.musician_id, transaction_type: "ticket_sale",
          total_amount: amount, musician_amount: musicianAmount,
          platform_commission: platformComm, commission_rate: 20.00,
          related_id: meta.concert_id,
        });
        await recordTransaction("concert_ticket", meta.user_id, meta.musician_id, 0.20);
      }

      if (paymentType === "concert_gift") {
        log("Processing concert gift");
        const musicianAmount = amount * 0.80;
        const platformComm = amount * 0.20;
        
        await supabase.from("concert_gifts").insert({
          sender_id: meta.sender_id, musician_id: meta.musician_id,
          concert_id: meta.concert_id, gift_id: meta.gift_id,
          amount, musician_amount: musicianAmount, platform_commission: platformComm,
          message: meta.message, payment_status: "completed", stripe_session_id: sid,
        });
        await supabase.from("musician_earnings").insert({
          musician_id: meta.musician_id, transaction_type: "gift",
          total_amount: amount, musician_amount: musicianAmount,
          platform_commission: platformComm, commission_rate: 20.00,
          related_id: meta.concert_id,
        });
        await recordTransaction("concert_gift", meta.sender_id, meta.musician_id, 0.20);
      }

      if (paymentType === "song_request") {
        log("Processing song request");
        await supabase.from("concert_song_requests").insert({
          user_id: meta.user_id, song_title: meta.song || "Unknown",
          artist_name: meta.artist || null, tier: meta.tier || "standard",
          amount, musician_amount: amount * 0.80, platform_commission: amount * 0.20,
          status: "approved", stripe_session_id: sid,
        });
        await recordTransaction("song_request", meta.user_id, undefined, 0.20);
      }

      if (paymentType === "collectible_ticket") {
        log("Processing collectible ticket");
        await supabase.from("collectible_purchases").insert({
          user_id: meta.user_id || meta.buyer_id,
          product_type: "collectible_ticket",
          stripe_payment_id: sid, amount: Math.round(amount * 100),
          status: "completed",
        });
        await recordTransaction("collectible_ticket", meta.user_id || meta.buyer_id);
      }

      if (paymentType === "merch_purchase") {
        log("Processing merch purchase");
        await supabase.from("creator_merch_orders").update({
          status: "paid", stripe_payment_intent: session.payment_intent,
        }).eq("stripe_session_id", sid).eq("status", "pending");
        await recordTransaction("merch_purchase", meta.buyer_id, meta.creator_id, 0.10);
      }

      // ============================================
      // GIFTS SECTION
      // ============================================

      if (paymentType === "dating_gift") {
        log("Processing dating gift");
        await supabase.from("dating_sent_gifts").insert({
          sender_id: meta.sender_id, receiver_id: meta.receiver_id,
          gift_id: meta.gift_id, match_id: meta.match_id,
          amount, message: meta.message, status: "completed",
          stripe_session_id: sid,
        });
        await recordTransaction("dating_gift", meta.sender_id);
      }

      if (paymentType === "stream_gift") {
        log("Processing stream gift");
        await supabase.from("stream_gifts").insert({
          sender_id: meta.sender_id, receiver_id: meta.receiver_id,
          gift_id: meta.gift_id, amount, message: meta.message,
          stripe_session_id: sid,
        });
        await recordTransaction("stream_gift", meta.sender_id, meta.receiver_id, 0.10);
      }

      if (paymentType === "platform_gift") {
        log("Processing platform gift");
        await supabase.from("sent_platform_gifts").insert({
          sender_id: meta.sender_id, receiver_id: meta.receiver_id,
          gift_id: meta.gift_id, context_type: meta.context_type,
          context_id: meta.context_id || null, message: meta.message,
          amount, status: "completed", stripe_session_id: sid,
        });
        await recordTransaction("platform_gift", meta.sender_id, meta.receiver_id, 0.10);
      }

      if (paymentType === "masterchef_gift") {
        log("Processing MasterChef gift");
        await supabase.from("masterchef_sent_gifts").update({
          status: "completed", stripe_session_id: sid,
        }).eq("sender_id", meta.sender_id).eq("chef_id", meta.chef_id)
          .eq("gift_id", meta.gift_id).is("stripe_session_id", null);
        await recordTransaction("masterchef_gift", meta.sender_id, meta.chef_id, 0.20);
      }

      if (paymentType === "influencer_gift") {
        log("Processing influencer gift");
        await supabase.from("influencer_sent_gifts").update({
          status: "completed", stripe_payment_intent: session.payment_intent,
        }).eq("sender_id", meta.sender_id).eq("influencer_id", meta.influencer_id)
          .eq("gift_id", meta.gift_id).eq("stripe_session_id", sid);
        await recordTransaction("influencer_gift", meta.sender_id, meta.influencer_id, 0.20);
      }

      if (paymentType === "shadow_gift") {
        log("Processing shadow gift");
        await supabase.from("shadow_gifts").insert({
          battle_id: meta.battle_id, participant_id: meta.participant_id,
          sender_id: meta.sender_id, gift_type: meta.gift_type || "boost",
          gift_amount: amount, stripe_payment_id: sid, status: "completed",
        });
        await recordTransaction("shadow_gift", meta.sender_id);
      }

      // ============================================
      // TIPS SECTION
      // ============================================

      if (paymentType === "influencer_tip") {
        log("Processing influencer tip");
        await supabase.from("influencer_tips").insert({
          sender_id: meta.sender_id, influencer_id: meta.influencer_id,
          amount, message: meta.message, status: "completed",
          stripe_session_id: sid,
        });
        await recordTransaction("influencer_tip", meta.sender_id, meta.influencer_id, 0.20);
      }

      if (paymentType === "tip_purchase") {
        log("Processing comedy tip");
        await supabase.from("comedy_tips").insert({
          from_user_id: meta.sender_id || meta.user_id,
          to_comedian_id: meta.comedian_id || meta.receiver_id,
          show_id: meta.show_id || null,
          amount_coins: Math.round(amount * 100),
          message: meta.message, tip_type: meta.tip_type || "applause",
        });
        await recordTransaction("tip_purchase", meta.sender_id || meta.user_id);
      }

      // ============================================
      // CREDITS SECTION
      // ============================================

      if (paymentType === "messenger_ai_credits") {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits("messenger_ai_credits", meta.user_id, cr);
          await recordTransaction("messenger_ai_credits", meta.user_id);
        }
      }

      if (paymentType === "creative_forge_credits") {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits("creative_forge_credits", meta.user_id, cr);
          await recordTransaction("creative_forge_credits", meta.user_id);
        }
      }

      if (paymentType === "coloring_credits" || paymentType === "coloring_pay_per_use") {
        const cr = parseInt(meta.credits || "1");
        await upsertCredits("coloring_credits", meta.user_id, cr);
        await recordTransaction("coloring_credits", meta.user_id);
      }

      if (paymentType === "lie_detector_credits") {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits("lie_detector_credits", meta.user_id, cr);
          await recordTransaction("lie_detector_credits", meta.user_id);
        }
      }

      if (paymentType === "secret_santa_credits") {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits("secret_santa_credits", meta.user_id, cr);
          await recordTransaction("secret_santa_credits", meta.user_id);
        }
      }

      if (paymentType === "f1_currency") {
        const cr = parseInt(meta.credits || meta.coins || "0");
        if (cr > 0) {
          const { data: existing } = await supabase.from("f1_user_credits").select("id, credits").eq("user_id", meta.user_id).maybeSingle();
          if (existing) {
            await supabase.from("f1_user_credits").update({
              credits: (existing.credits || 0) + cr, updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from("f1_user_credits").insert({ user_id: meta.user_id, credits: cr });
          }
          await recordTransaction("f1_currency", meta.user_id);
        }
      }

      // Additional credit types
      const CREDIT_TYPE_TABLE_MAP: Record<string, string> = {
        analyzer_credits: "analyzer_credits",
        astrology_credits: "astrology_credits",
        cooking_credits: "cooking_credits",
        ai_credits: "ai_credits",
        handwriting_credits: "handwriting_credits",
        iq_credits: "iq_credits",
        photo_credits: "photo_credits",
        phobia_credits: "phobia_credits",
        video_ad_credits: "video_ad_credits",
        tutoring_credits: "tutoring_credits",
      };

      if (CREDIT_TYPE_TABLE_MAP[paymentType]) {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits(CREDIT_TYPE_TABLE_MAP[paymentType], meta.user_id, cr);
          await recordTransaction(paymentType, meta.user_id);
        }
      }

      if (paymentType === "emotion_market_purchase") {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits("emotion_credits", meta.user_id, cr);
          await recordTransaction("emotion_market_purchase", meta.user_id);
        }
      }

      // ============================================
      // MARKETPLACE / PURCHASES SECTION
      // ============================================

      if (paymentType === "learning_content") {
        log("Processing learning content purchase");
        await supabase.from("purchased_learning_content").insert({
          user_id: meta.user_id, content_type: meta.content_type,
          content_id: meta.content_id, title: meta.title,
          price: amount, stripe_session_id: sid, status: "active",
        });
        await recordTransaction("learning_content", meta.user_id);
      }

      if (paymentType === "content_pack_purchase") {
        log("Processing content pack purchase");
        const platformComm = parseFloat(meta.platform_commission || "0");
        const creatorEarning = parseFloat(meta.creator_earning || "0");
        await supabase.from("creator_content_purchases").insert({
          pack_id: meta.pack_id, buyer_id: meta.buyer_id,
          creator_id: meta.creator_id, amount_paid: amount,
          platform_commission: platformComm, creator_earning: creatorEarning,
          stripe_payment_intent_id: session.payment_intent, status: "completed",
        });
        await recordTransaction("content_pack", meta.buyer_id, meta.creator_id, 0.10);
      }

      if (paymentType === "certificate") {
        log("Processing certificate purchase");
        await supabase.from("certificate_purchases").update({
          status: "completed", stripe_session_id: sid,
        }).eq("user_id", meta.user_id).eq("status", "pending");
        await recordTransaction("certificate", meta.user_id);
      }

      if (paymentType === "featured_listing") {
        log("Processing featured listing");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(meta.duration_days || "7"));
        await supabase.from("featured_listings").insert({
          user_id: meta.user_id, item_type: meta.item_type,
          item_id: meta.item_id, price: amount,
          duration_days: parseInt(meta.duration_days || "7"),
          expires_at: expiresAt.toISOString(), is_active: true,
        });
        await recordTransaction("featured_listing", meta.user_id);
      }

      if (paymentType === "ar_preview") {
        log("Processing AR preview");
        await supabase.from("ar_preview_sessions").update({
          payment_status: "completed", stripe_payment_intent_id: session.payment_intent,
        }).eq("user_id", meta.user_id).eq("payment_status", "pending");
        await recordTransaction("ar_preview", meta.user_id);
      }

      if (paymentType === "stream_access") {
        log("Processing stream access");
        await supabase.from("stream_access_purchases").update({
          status: "completed",
        }).eq("stripe_session_id", sid).eq("status", "pending");
        await recordTransaction("stream_access", meta.user_id || meta.buyer_id);
      }

      if (paymentType === "paid_message") {
        log("Processing paid message");
        await supabase.from("paid_messages").update({
          status: "paid",
        }).eq("stripe_session_id", sid).eq("status", "pending");
        await recordTransaction("paid_message", meta.sender_id || meta.user_id);
      }

      if (paymentType === "coupon_marketplace_access") {
        log("Processing coupon marketplace access");
        await supabase.from("coupon_purchases").update({
          status: "completed",
        }).eq("stripe_session_id", sid).eq("status", "pending");
        await recordTransaction("coupon_marketplace_access", meta.user_id);
      }

      if (paymentType === "marketplace_purchase") {
        log("Processing marketplace purchase");
        await supabase.from("marketplace_orders").update({
          status: "paid", paid_at: new Date().toISOString(),
        }).eq("stripe_session_id", sid).eq("status", "pending");
        await recordTransaction("marketplace_purchase", meta.buyer_id, meta.seller_id, 0.10);
      }

      if (paymentType === "course_purchase") {
        log("Processing course purchase");
        await supabase.from("course_enrollments").insert({
          course_id: meta.courseId, user_id: meta.userId,
          stripe_session_id: sid, status: "active",
        });
        await supabase.from("course_purchases").insert({
          course_id: meta.courseId, user_id: meta.userId,
          amount, stripe_session_id: sid, status: "completed",
        });
        await recordTransaction("course_purchase", meta.userId, meta.instructorId, 0.30);
      }

      if (paymentType === "campaign_donation") {
        log("Processing campaign donation");
        const platformFee = parseFloat(meta.platform_fee || "0");
        const netAmount = parseFloat(meta.net_amount || String(amount));
        await supabase.from("campaign_donations").insert({
          donor_id: meta.donor_id !== "guest" ? meta.donor_id : null,
          donor_email: meta.donor_email || null,
          donor_name: meta.donor_name || null,
          campaign_id: meta.campaign_id, campaign_type: meta.campaign_type,
          amount, platform_fee: platformFee, net_amount: netAmount,
          is_monthly: meta.is_monthly === "true",
          is_anonymous: meta.is_anonymous === "true",
          message: meta.message, stripe_payment_id: sid, status: "completed",
        });
        // Update campaign raised amount
        await supabase.rpc("increment_campaign_raised", {
          p_campaign_id: meta.campaign_id, p_amount: netAmount,
        }).then(r => { if (r.error) log("Campaign increment error (non-critical)", r.error); });
      }

      if (paymentType === "stock_content_purchase") {
        log("Processing stock content purchase");
        await supabase.from("stock_content_downloads").insert({
          content_id: meta.contentId, buyer_id: meta.buyerId !== "guest" ? meta.buyerId : null,
          buyer_email: meta.buyerEmail || null, stripe_session_id: sid,
        });
        // Update content stats
        await supabase.from("stock_content_items").update({
          total_downloads: supabase.rpc ? undefined : 0,
        }).eq("id", meta.contentId);
        // Add creator earnings
        const creatorEarning = parseFloat(meta.creatorEarning || "0");
        if (creatorEarning > 0 && meta.creatorId) {
          await supabase.from("stock_content_earnings").insert({
            creator_id: meta.creatorId, content_id: meta.contentId,
            amount: creatorEarning, stripe_session_id: sid,
          }).then(r => { if (r.error) log("Earnings insert error (non-critical)", r.error); });
        }
      }

      // ============================================
      // PROPERTY SECTION
      // ============================================

      if (paymentType === "property_listing") {
        log("Processing property listing payment");
        await supabase.from("property_listing_packages").update({
          payment_status: "completed",
        }).eq("stripe_session_id", sid);
        await recordTransaction("property_listing", meta.user_id);
      }

      // ============================================
      // HOLOGRAPHIC & TIME CAPSULE
      // ============================================

      if (paymentType === "holographic_avatar") {
        log("Processing holographic avatar");
        const purchaseData: any = {
          user_id: meta.user_id, service_type: meta.feature || "unknown",
          status: "active", stripe_session_id: sid,
        };
        if (session.mode === "subscription" && session.subscription) {
          purchaseData.stripe_subscription_id = session.subscription;
        } else {
          const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
          purchaseData.expires_at = exp.toISOString();
        }
        await supabase.from("holographic_purchases").insert(purchaseData);
      }

      if (paymentType === "time_capsule" || paymentType === "time_capsule_premium") {
        log("Processing time capsule");
        const isSub = paymentType === "time_capsule_premium";
        const years = meta.duration_years ? parseInt(meta.duration_years) : null;
        const purchaseData: any = {
          user_id: meta.user_id,
          service_type: isSub ? "premium_subscription" : `${years}_year`,
          status: "active", stripe_session_id: sid, duration_years: years,
        };
        if (isSub && session.subscription) {
          purchaseData.stripe_subscription_id = session.subscription;
        } else if (years) {
          const exp = new Date(); exp.setFullYear(exp.getFullYear() + years);
          purchaseData.expires_at = exp.toISOString();
        }
        await supabase.from("time_capsule_purchases").insert(purchaseData);
      }

      // ============================================
      // SERVICE ORDER
      // ============================================

      if (paymentType === "service_order") {
        log("Processing service order");
        await supabase.from("service_orders").update({
          status: "paid", paid_at: new Date().toISOString(),
        }).eq("stripe_session_id", sid).eq("status", "pending");
        await recordTransaction("service_order", meta.buyer_id, meta.seller_id, 0.15);
      }

      // ============================================
      // BRAIN DUEL CREDITS
      // ============================================

      if (paymentType === "brain_duel_credits") {
        const cr = parseInt(meta.credits || "0");
        if (cr > 0) {
          await upsertCredits("brain_duel_credits", meta.user_id, cr);
          await recordTransaction("brain_duel_credits", meta.user_id);
        }
      }

      // ============================================
      // BRAND BATTLE
      // ============================================

      if (paymentType === "brand_votes") {
        log("Processing brand votes purchase");
        await supabase.from("brand_battle_votes_purchases").insert({
          user_id: meta.user_id, amount, stripe_session_id: sid, status: "completed",
        }).then(r => { if (r.error) log("Brand votes insert (non-critical)", r.error); });
        await recordTransaction("brand_votes", meta.user_id);
      }

      if (paymentType === "brand_sponsorship") {
        log("Processing brand sponsorship");
        await supabase.from("brand_sponsorships").insert({
          user_id: meta.user_id, tier: meta.tier, amount, status: "active",
          stripe_session_id: sid,
        }).then(r => { if (r.error) log("Brand sponsorship insert (non-critical)", r.error); });
        await recordTransaction("brand_sponsorship", meta.user_id);
      }

      // ============================================
      // COMEDY COINS
      // ============================================

      if (paymentType === "comedy_coins") {
        const coins = parseInt(meta.coins || "0");
        if (coins > 0) {
          const { data: existing } = await supabase.from("comedy_coins").select("id, balance").eq("user_id", meta.user_id).maybeSingle();
          if (existing) {
            await supabase.from("comedy_coins").update({
              balance: (existing.balance || 0) + coins, updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from("comedy_coins").insert({ user_id: meta.user_id, balance: coins });
          }
          log("Comedy coins added", { coins });
        }
        await recordTransaction("comedy_coins", meta.user_id);
      }

      // ============================================
      // CONFESSION TOKENS
      // ============================================

      if (paymentType === "confession_tokens") {
        log("Processing confession tokens");
        await upsertCredits("absolution_tokens", meta.user_id, meta.service_type === "premium" ? 50 : 10);
        await recordTransaction("confession_tokens", meta.user_id);
      }

      // ============================================
      // CONSULTATION
      // ============================================

      if (paymentType === "consultation") {
        log("Processing consultation booking");
        await supabase.from("consultation_bookings").insert({
          user_id: meta.user_id, duration: meta.duration, amount,
          stripe_session_id: sid, status: "confirmed",
        }).then(r => { if (r.error) log("Consultation insert (non-critical)", r.error); });
        await recordTransaction("consultation", meta.user_id);
      }

      // ============================================
      // CRYSTAL PURCHASE
      // ============================================

      if (paymentType === "crystal_purchase") {
        log("Processing crystal marketplace purchase");
        await supabase.from("crystal_marketplace_orders").update({
          status: "paid", paid_at: new Date().toISOString(),
        }).eq("id", meta.order_id).eq("status", "pending");
        await recordTransaction("crystal_purchase", meta.buyer_id, undefined, 0.15);
      }

      // ============================================
      // CRYSTAL ENERGY NETWORK
      // ============================================

      if (paymentType === "crystal_energy") {
        log("Processing crystal energy purchase");
        await supabase.from("crystal_energy_purchases").insert({
          user_id: meta.user_id, feature: meta.feature, feature_key: meta.feature_key,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Crystal energy insert (non-critical)", r.error); });
        await recordTransaction("crystal_energy", meta.user_id);
      }

      // ============================================
      // DNA MEMORY NETWORK
      // ============================================

      if (paymentType === "dna_memory") {
        log("Processing DNA memory service");
        await supabase.from("dna_memory_purchases").insert({
          user_id: meta.user_id, service_type: meta.service_type,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("DNA memory insert (non-critical)", r.error); });
        await recordTransaction("dna_memory", meta.user_id);
      }

      // ============================================
      // ESCAPE ROOM
      // ============================================

      if (paymentType === "escape_room") {
        log("Processing escape room purchase");
        await supabase.from("escape_room_purchases").insert({
          user_id: meta.userId, room_id: meta.roomId,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Escape room insert (non-critical)", r.error); });
        await recordTransaction("escape_room", meta.userId);
      }

      // ============================================
      // FASHION MARKETPLACE
      // ============================================

      if (paymentType === "fashion_purchase") {
        log("Processing fashion purchase");
        await supabase.from("fashion_marketplace_orders").insert({
          buyer_id: meta.buyerId, design_id: meta.designId,
          design_title: meta.designTitle, product_type: meta.productType,
          amount, stripe_session_id: sid, status: "completed",
        }).then(r => { if (r.error) log("Fashion order insert (non-critical)", r.error); });
        await recordTransaction("fashion_purchase", meta.buyerId);
      }

      // ============================================
      // FITSLIM PLAN
      // ============================================

      if (paymentType === "fitslim_plan") {
        log("Processing fitslim plan");
        await supabase.from("fitness_plans").update({
          status: "active", paid_at: new Date().toISOString(),
        }).eq("id", meta.plan_id).eq("user_id", meta.user_id);
        await recordTransaction("fitslim_plan", meta.user_id);
      }

      // ============================================
      // FUTURE FACE
      // ============================================

      if (paymentType === "future_face") {
        log("Processing future face purchase");
        await supabase.from("future_face_purchases").insert({
          user_id: meta.user_id, plan_type: meta.plan_type,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Future face insert (non-critical)", r.error); });
        await recordTransaction("future_face", meta.user_id);
      }

      // ============================================
      // HOLOGRAPHIC CONCERT
      // ============================================

      if (paymentType === "holographic_concert") {
        log("Processing holographic concert");
        await supabase.from("holographic_purchases").insert({
          user_id: meta.user_id, service_type: meta.feature || "concert",
          status: "active", stripe_session_id: sid,
        }).then(r => { if (r.error) log("Holographic concert insert (non-critical)", r.error); });
        await recordTransaction("holographic_concert", meta.user_id);
      }

      // ============================================
      // HORSE RACING CURRENCY
      // ============================================

      if (paymentType === "horse_currency") {
        log("Processing horse currency");
        const coins = parseInt(meta.coins || "0");
        const gems = parseInt(meta.gems || "0");
        if (coins > 0 || gems > 0) {
          const { data: existing } = await supabase.from("horse_racing_currency").select("id, coins, gems").eq("user_id", meta.user_id).maybeSingle();
          if (existing) {
            await supabase.from("horse_racing_currency").update({
              coins: (existing.coins || 0) + coins,
              gems: (existing.gems || 0) + gems,
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from("horse_racing_currency").insert({ user_id: meta.user_id, coins, gems });
          }
          log("Horse currency added", { coins, gems });
        }
        await recordTransaction("horse_currency", meta.user_id);
      }

      // ============================================
      // LEAD BOOST (Property)
      // ============================================

      if (paymentType === "lead_boost") {
        log("Processing lead boost");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await supabase.from("property_lead_boosts").insert({
          user_id: meta.user_id, property_id: meta.property_id,
          amount, stripe_session_id: sid, status: "active",
          expires_at: expiresAt.toISOString(),
        }).then(r => { if (r.error) log("Lead boost insert (non-critical)", r.error); });
        await recordTransaction("lead_boost", meta.user_id);
      }

      // ============================================
      // STORY PURCHASE
      // ============================================

      if (paymentType === "story_purchase") {
        log("Processing story purchase");
        await supabase.from("kids_story_purchases").insert({
          user_id: meta.user_id, story_type: meta.story_type,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Story purchase insert (non-critical)", r.error); });
        await recordTransaction("story_purchase", meta.user_id);
      }

      // ============================================
      // TEEN CAREER COUNSELOR
      // ============================================

      if (paymentType === "teen_career") {
        log("Processing teen career counselor purchase");
        await supabase.from("teen_career_purchases").insert({
          user_id: meta.user_id, amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Teen career insert (non-critical)", r.error); });
        await recordTransaction("teen_career", meta.user_id);
      }

      // ============================================
      // COLLECTIBLES CREDITS
      // ============================================

      if (paymentType === "collectibles_credits") {
        log("Processing collectibles credits");
        const cr = parseInt(meta.credits || "10");
        await upsertCredits("collectibles_credits", meta.user_id, cr);
        await recordTransaction("collectibles_credits", meta.user_id);
      }

      // ============================================
      // VOICE CLONE
      // ============================================

      if (paymentType === "voice_clone") {
        log("Processing voice clone purchase");
        await supabase.from("voice_clone_purchases").insert({
          user_id: meta.user_id, amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Voice clone insert (non-critical)", r.error); });
        await recordTransaction("voice_clone", meta.user_id);
      }

      // ============================================
      // MULTIVERSE SERVICE
      // ============================================
      // SPORTS ARENA COINS (Football, Basketball, Hockey, Tennis, AF)
      // ============================================

      const SPORTS_COIN_TABLES: Record<string, string> = {
        football_coins: "football_coins",
        basketball_coins: "basketball_coins",
        hockey_coins: "hockey_coins",
        tennis_coins: "tennis_coins",
        af_coins: "american_football_coins",
      };

      if (SPORTS_COIN_TABLES[paymentType]) {
        const table = SPORTS_COIN_TABLES[paymentType];
        const coins = parseInt(meta.coins || meta.credits || "0");
        if (coins > 0) {
          const { data: existing } = await supabase.from(table).select("id, balance").eq("user_id", meta.user_id).maybeSingle();
          if (existing) {
            await supabase.from(table).update({
              balance: (existing.balance || 0) + coins,
              total_purchased: (existing.total_purchased || 0) + coins,
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from(table).insert({
              user_id: meta.user_id,
              balance: coins,
              total_purchased: coins,
            });
          }
          log(`${paymentType} added`, { coins, table });
        }
        await recordTransaction(paymentType, meta.user_id);
      }

      // ============================================
      // GLAMOUR COINS
      // ============================================

      if (paymentType === "glamour_coins") {
        const coins = parseInt(meta.coins || "0");
        if (coins > 0) {
          const { data: existing } = await supabase.from("glamour_coins").select("id, balance").eq("user_id", meta.user_id).maybeSingle();
          if (existing) {
            await supabase.from("glamour_coins").update({
              balance: (existing.balance || 0) + coins,
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from("glamour_coins").insert({ user_id: meta.user_id, balance: coins });
          }
          log("Glamour coins added", { coins });
        }
        await recordTransaction("glamour_coins", meta.user_id);
      }

      // ============================================

      if (paymentType === "multiverse_service") {
        log("Processing multiverse service");
        await supabase.from("multiverse_purchases").insert({
          user_id: meta.user_id, service_type: meta.service_type,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Multiverse insert (non-critical)", r.error); });
        await recordTransaction("multiverse_service", meta.user_id);
      }

      // ============================================
      // REINCARNATION SERVICE
      // ============================================

      if (paymentType === "reincarnation_service") {
        log("Processing reincarnation service");
        await supabase.from("reincarnation_purchases").insert({
          user_id: meta.user_id, service_type: meta.service_type,
          amount, stripe_session_id: sid, status: "active",
        }).then(r => { if (r.error) log("Reincarnation insert (non-critical)", r.error); });
        await recordTransaction("reincarnation_service", meta.user_id);
      }

      // ============================================
      // SUBSCRIPTION-BASED (check-* verified, record transaction only)
      // ============================================

      const SUBSCRIPTION_TYPES = [
        "psychology_subscription", "best_friend_subscription", "science_subscription",
        "shadow_subscription", "sports_subscription", "wellness_subscription",
        "time_reversal_subscription", "voice_subscription", "companions",
        "skill_swap_subscription", "tipster_subscription", "vip_subscription",
        "lottery_subscription", "phobia_subscription", "school_subscription",
      ];

      if (SUBSCRIPTION_TYPES.includes(paymentType)) {
        log(`Processing subscription: ${paymentType}`);
        await recordTransaction(paymentType, meta.user_id);
      }

      // ============================================
      // UNHANDLED TYPE LOGGING
      // ============================================

      if (!paymentType) {
        log("WARNING: No payment type in metadata", { metadata: meta });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
});
