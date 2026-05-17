// Router edge function – consolidates handwriting AI tools + billing into one slot.
// AI actions: signature, compatibility, mood, forgery, twin, famous, academy, pdf-report,
//             voice-diary, hr-bulk-analyze, couples-record-compatibility
// Billing actions: couples-checkout, couples-status, accept-couples-invite,
//                  hr-checkout, hr-status, portal
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const PRICES = {
  couples: "price_1TNs5DGaXSfGtYFtIEzPmxzo", // €14.99/mo
  hr_pro: "price_1TNs5EGaXSfGtYFt4pks23YW",  // €99/mo
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const AI_URL = "https://api.openai.com/v1/chat/completions";

async function callAI(body: unknown) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("Rate limited");
  if (res.status === 402) throw new Error("AI credits exhausted");
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function chargeCredits(supabase: any, userId: string, cost: number) {
  const { data: credits } = await supabase
    .from("handwriting_credits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!credits || (credits.credits_remaining ?? 0) < cost) {
    throw new Error("Insufficient credits");
  }
  await supabase
    .from("handwriting_credits")
    .update({ credits_remaining: credits.credits_remaining - cost })
    .eq("user_id", userId);
  return credits;
}

function cosine(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const av = a?.[k] ?? 0, bv = b?.[k] ?? 0;
    dot += av * bv; na += av * av; nb += bv * bv;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const action = body.action as string;
    if (!action) return json({ error: "action required" }, 400);

    // ============================================================
    // BILLING ACTIONS (Stripe) — Couples + HR Pro
    // ============================================================
    const BILLING_ACTIONS = new Set([
      "couples-checkout", "couples-status", "accept-couples-invite",
      "hr-checkout", "hr-status", "portal",
    ]);
    if (BILLING_ACTIONS.has(action)) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) return json({ error: "Stripe not configured" }, 500);
      if (!user.email) return json({ error: "User email required" }, 400);
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const origin = req.headers.get("origin") || "https://uniqueapp.fun";

      const getCustomerId = async (): Promise<string> => {
        const list = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (list.data.length > 0) return list.data[0].id;
        const c = await stripe.customers.create({ email: user.email!, metadata: { user_id: user.id } });
        return c.id;
      };

      // ---- COUPLES CHECKOUT ----
      if (action === "couples-checkout") {
        const partnerEmail = (body.partnerEmail as string)?.trim().toLowerCase();
        if (!partnerEmail || !/.+@.+\..+/.test(partnerEmail)) {
          return json({ error: "Valid partner email required" }, 400);
        }
        if (partnerEmail === user.email!.toLowerCase()) {
          return json({ error: "Partner email must be different from yours" }, 400);
        }
        const customerId = await getCustomerId();
        const { data: subRow, error: insErr } = await supabase
          .from("couples_subscriptions")
          .insert({
            partner_a_user_id: user.id,
            partner_b_email: partnerEmail,
            status: "pending",
            stripe_customer_id: customerId,
          })
          .select()
          .single();
        if (insErr) return json({ error: "Could not create subscription record" }, 500);
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [{ price: PRICES.couples, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/handwriting?couples=success&sub_id=${subRow.id}`,
          cancel_url: `${origin}/handwriting?couples=cancelled`,
          metadata: { user_id: user.id, couples_subscription_id: subRow.id, plan: "couples" },
          subscription_data: { metadata: { user_id: user.id, couples_subscription_id: subRow.id, plan: "couples" } },
        });
        return json({ url: session.url, subscriptionId: subRow.id, inviteToken: subRow.invite_token });
      }

      // ---- COUPLES STATUS ----
      if (action === "couples-status") {
        const { data: rows } = await supabase
          .from("couples_subscriptions")
          .select("*")
          .or(`partner_a_user_id.eq.${user.id},partner_b_user_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(1);
        const sub = rows?.[0];
        if (!sub) return json({ active: false });
        if (sub.stripe_subscription_id) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
            const isActive = ["active", "trialing"].includes(stripeSub.status);
            const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
            await supabase
              .from("couples_subscriptions")
              .update({
                status: isActive ? "active" : stripeSub.status,
                current_period_end: periodEnd,
                cancelled_at: stripeSub.cancel_at_period_end ? new Date().toISOString() : null,
              })
              .eq("id", sub.id);
            return json({ active: isActive, subscription: { ...sub, status: stripeSub.status, current_period_end: periodEnd } });
          } catch (_) { /* fall through */ }
        }
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length === 0) return json({ active: false, subscription: sub });
        const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 5 });
        const couplesSub = subs.data.find((s) => s.items.data.some((i) => i.price.id === PRICES.couples));
        if (couplesSub) {
          const periodEnd = new Date(couplesSub.current_period_end * 1000).toISOString();
          await supabase
            .from("couples_subscriptions")
            .update({
              stripe_subscription_id: couplesSub.id,
              stripe_customer_id: customers.data[0].id,
              status: "active",
              started_at: sub.started_at ?? new Date().toISOString(),
              current_period_end: periodEnd,
            })
            .eq("id", sub.id);
          return json({ active: true, subscription: { ...sub, status: "active", current_period_end: periodEnd } });
        }
        return json({ active: false, subscription: sub });
      }

      // ---- ACCEPT COUPLES INVITE ----
      if (action === "accept-couples-invite") {
        const token = body.inviteToken as string;
        if (!token) return json({ error: "inviteToken required" }, 400);
        const { data: sub } = await supabase
          .from("couples_subscriptions")
          .select("*")
          .eq("invite_token", token)
          .maybeSingle();
        if (!sub) return json({ error: "Invalid invite token" }, 404);
        if (sub.partner_b_email.toLowerCase() !== user.email!.toLowerCase()) {
          return json({ error: "This invite is for a different email" }, 403);
        }
        const { error } = await supabase
          .from("couples_subscriptions")
          .update({ partner_b_user_id: user.id })
          .eq("id", sub.id);
        if (error) return json({ error: "Could not link account" }, 500);
        return json({ success: true, subscriptionId: sub.id });
      }

      // ---- HR CHECKOUT ----
      if (action === "hr-checkout") {
        const orgName = (body.orgName as string)?.trim();
        if (!orgName) return json({ error: "Organization name required" }, 400);
        const customerId = await getCustomerId();
        const { data: existing } = await supabase
          .from("hr_pro_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        let subId = existing?.id;
        if (!subId) {
          const { data: created, error: cErr } = await supabase
            .from("hr_pro_subscriptions")
            .insert({ user_id: user.id, org_name: orgName, status: "pending", stripe_customer_id: customerId })
            .select("id")
            .single();
          if (cErr) return json({ error: "Could not create HR subscription" }, 500);
          subId = created.id;
        } else {
          await supabase
            .from("hr_pro_subscriptions")
            .update({ org_name: orgName, stripe_customer_id: customerId })
            .eq("id", subId);
        }
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [{ price: PRICES.hr_pro, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/handwriting?hr=success`,
          cancel_url: `${origin}/handwriting?hr=cancelled`,
          metadata: { user_id: user.id, hr_subscription_id: subId, plan: "hr_pro" },
          subscription_data: { metadata: { user_id: user.id, hr_subscription_id: subId, plan: "hr_pro" } },
        });
        return json({ url: session.url });
      }

      // ---- HR STATUS ----
      if (action === "hr-status") {
        const { data: hr } = await supabase
          .from("hr_pro_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!hr) return json({ active: false });
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length === 0) return json({ active: false, subscription: hr });
        const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 5 });
        const hrSub = subs.data.find((s) => s.items.data.some((i) => i.price.id === PRICES.hr_pro));
        if (!hrSub) {
          await supabase.from("hr_pro_subscriptions").update({ status: "inactive" }).eq("id", hr.id);
          return json({ active: false, subscription: { ...hr, status: "inactive" } });
        }
        const periodEnd = new Date(hrSub.current_period_end * 1000).toISOString();
        await supabase
          .from("hr_pro_subscriptions")
          .update({
            status: "active",
            stripe_subscription_id: hrSub.id,
            stripe_customer_id: customers.data[0].id,
            started_at: hr.started_at ?? new Date().toISOString(),
            current_period_end: periodEnd,
          })
          .eq("id", hr.id);
        return json({ active: true, subscription: { ...hr, status: "active", current_period_end: periodEnd, stripe_subscription_id: hrSub.id } });
      }

      // ---- CUSTOMER PORTAL ----
      if (action === "portal") {
        const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length === 0) return json({ error: "No Stripe customer found" }, 404);
        const portal = await stripe.billingPortal.sessions.create({
          customer: customers.data[0].id,
          return_url: `${origin}/handwriting`,
        });
        return json({ url: portal.url });
      }
    }

    // ---------- ANALYZE (personal/professional/relationship/business) ----------
    if (action === "analyze") {
      const { imageUrl, analysisType } = body;
      if (!imageUrl || !analysisType) return json({ error: "imageUrl and analysisType required" }, 400);
      const COSTS: Record<string, number> = { personal: 5, professional: 10, relationship: 15, business: 20 };
      const cost = COSTS[analysisType];
      if (!cost) return json({ error: "Invalid analysisType" }, 400);
      await chargeCredits(supabase, user.id, cost);

      const focus: Record<string, string> = {
        personal: "Focus on: Personal growth, emotional intelligence, self-awareness, relationship compatibility, life balance.",
        professional: "Focus on: Career strengths, work style, team collaboration, leadership potential, professional development areas.",
        relationship: "Focus on: Communication patterns, emotional availability, conflict resolution style, intimacy indicators, partner compatibility.",
        business: "Focus on: Decision-making under pressure, risk tolerance, negotiation style, strategic thinking, business acumen.",
      };
      const sys = `You are a professional graphologist with 20+ years of experience. Return ONLY valid JSON with this exact structure: { "personality_traits": { "openness": string, "conscientiousness": string, "extraversion": string, "agreeableness": string, "neuroticism": string }, "strengths": string[], "weaknesses": string[], "emotional_state": string, "communication_style": string, "work_approach": string, "relationship_patterns": string, "decision_making": string, "stress_indicators": string, "creativity_level": string, "leadership_qualities": string, "detailed_analysis": string, "recommendations": string[] }. ${focus[analysisType] ?? ""}`;

      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: [
            { type: "text", text: "Please analyze this handwriting sample in detail." },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      let parsed: any;
      try { parsed = JSON.parse(content); } catch { return json({ error: "Invalid AI response format" }, 502); }

      const { data: saved, error: insErr } = await supabase.from("handwriting_analyses").insert({
        user_id: user.id, image_url: imageUrl, analysis_type: analysisType, credits_used: cost,
        personality_traits: parsed.personality_traits, strengths: parsed.strengths,
        weaknesses: parsed.weaknesses, emotional_state: parsed.emotional_state,
        communication_style: parsed.communication_style, work_approach: parsed.work_approach,
        relationship_patterns: parsed.relationship_patterns, decision_making: parsed.decision_making,
        stress_indicators: parsed.stress_indicators, creativity_level: parsed.creativity_level,
        leadership_qualities: parsed.leadership_qualities, detailed_analysis: parsed.detailed_analysis,
        recommendations: parsed.recommendations,
      }).select().single();
      if (insErr) return json({ error: insErr.message }, 500);
      return json({ success: true, analysis: saved });
    }

    // ---------- SIGNATURE (5 cr) ----------
    if (action === "signature") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a forensic graphologist specializing in signature analysis. Return strict JSON: { ego_score: 0-100, confidence_score: 0-100, public_persona: string, authenticity_score: 0-100, traits: string[], dominance: string, summary: string }." },
          { role: "user", content: [
            { type: "text", text: "Analyze this signature." },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_signature_analyses").insert({
        user_id: user.id, image_url: imageUrl,
        ego_score: parsed.ego_score, confidence_score: parsed.confidence_score,
        public_persona: parsed.public_persona, authenticity_score: parsed.authenticity_score,
        analysis: parsed, credits_used: 5,
      }).select().single();
      return json({ analysis: row });
    }

    // ---------- COMPATIBILITY (12 cr) ----------
    if (action === "compatibility") {
      const { imageAUrl, imageBUrl, context = "romantic" } = body;
      if (!imageAUrl || !imageBUrl) return json({ error: "Two images required" }, 400);
      await chargeCredits(supabase, user.id, 12);
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `You are a graphology compatibility expert. Compare two handwriting samples for ${context} compatibility. Return JSON: { compatibility_score: 0-100, dynamics: { communication, emotional, decision, conflict }, strengths: string[], challenges: string[], full_report: string }.` },
          { role: "user", content: [
            { type: "text", text: `Compare these two handwriting samples for ${context} compatibility.` },
            { type: "image_url", image_url: { url: imageAUrl } },
            { type: "image_url", image_url: { url: imageBUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_compatibility_matches").insert({
        user_id: user.id, image_a_url: imageAUrl, image_b_url: imageBUrl, context,
        compatibility_score: parsed.compatibility_score, dynamics: parsed.dynamics,
        strengths: parsed.strengths, challenges: parsed.challenges,
        full_report: parsed.full_report, credits_used: 12,
      }).select().single();
      return json({ result: row });
    }

    // ---------- MOOD (3 cr) ----------
    if (action === "mood") {
      const { imageUrl, notes } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, 3);
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a graphology mood analyst. Analyze handwriting for current emotional state. Return JSON: { mood_score: 0-100, stress_score: 0-100, energy_score: 0-100, focus_score: 0-100, ai_insight: short paragraph }." },
          { role: "user", content: [
            { type: "text", text: notes ? `Notes: ${notes}` : "Daily mood scan." },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_mood_scans").insert({
        user_id: user.id, image_url: imageUrl, notes,
        mood_score: parsed.mood_score, stress_score: parsed.stress_score,
        energy_score: parsed.energy_score, focus_score: parsed.focus_score,
        ai_insight: parsed.ai_insight, credits_used: 3,
      }).select().single();
      return json({ scan: row });
    }

    // ---------- FORGERY (15 cr) ----------
    if (action === "forgery") {
      const { referenceUrl, suspectUrl } = body;
      if (!referenceUrl || !suspectUrl) return json({ error: "Two images required" }, 400);
      await chargeCredits(supabase, user.id, 15);
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a court-grade forensic document examiner. Compare reference vs suspect signature/handwriting. Return strict JSON: { authenticity_probability: 0-100, forgery_probability: 0-100, verdict: 'AUTHENTIC'|'LIKELY_AUTHENTIC'|'SUSPICIOUS'|'LIKELY_FORGERY'|'FORGERY', red_flags: [{trait, severity}], matching_traits: [{trait, similarity}], detailed_report: string }." },
          { role: "user", content: [
            { type: "text", text: "First image is the REFERENCE (known authentic). Second image is the SUSPECT sample." },
            { type: "image_url", image_url: { url: referenceUrl } },
            { type: "image_url", image_url: { url: suspectUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_forgery_checks").insert({
        user_id: user.id, reference_url: referenceUrl, suspect_url: suspectUrl,
        authenticity_probability: parsed.authenticity_probability,
        forgery_probability: parsed.forgery_probability,
        verdict: parsed.verdict, red_flags: parsed.red_flags,
        matching_traits: parsed.matching_traits, detailed_report: parsed.detailed_report,
        credits_used: 15,
      }).select().single();
      return json({ check: row });
    }

    // ---------- TWIN FINDER (5 cr) ----------
    if (action === "twin") {
      const { imageUrl, displayName, isPublic = true } = body;
      if (!imageUrl || !displayName) return json({ error: "imageUrl and displayName required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Extract a numeric trait vector for handwriting matching. Return JSON: { vector: { slant, pressure, size, spacing, loops, angularity, speed, regularity, baseline, creativity, extroversion, analytical }, summary: string } where each value is 0..100." },
          { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      await supabase.from("handwriting_twin_profiles").upsert({
        user_id: user.id, display_name: displayName, sample_url: imageUrl,
        trait_vector: parsed.vector, is_public: isPublic, updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      const { data: others } = await supabase
        .from("handwriting_twin_profiles")
        .select("user_id, display_name, sample_url, trait_vector")
        .neq("user_id", user.id).eq("is_public", true).limit(200);
      const matches = (others ?? []).map((o: any) => ({
        ...o, similarity: Math.round(cosine(parsed.vector, o.trait_vector as any) * 100),
      })).sort((a: any, b: any) => b.similarity - a.similarity).slice(0, 5);
      return json({ matches, your_summary: parsed.summary });
    }

    // ---------- FAMOUS COMPARISON (5 cr) ----------
    if (action === "famous") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Compare handwriting to famous historical figures (Einstein, Napoleon, Mozart, Marie Curie, Tesla, Da Vinci, Picasso, Hemingway). Pick best match. Return JSON: { matched_figure: string, match_score: 0-100, shared_traits: string[], ai_blurb: short fun paragraph }." },
          { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_famous_comparisons").insert({
        user_id: user.id, image_url: imageUrl,
        matched_figure: parsed.matched_figure, match_score: parsed.match_score,
        shared_traits: parsed.shared_traits, ai_blurb: parsed.ai_blurb, credits_used: 5,
      }).select().single();
      return json({ comparison: row });
    }

    // ---------- ACADEMY (free / quiz / complete) ----------
    if (action === "academy") {
      const sub = body.subAction as string;
      if (sub === "complete") {
        const { lessonId, quizScore } = body;
        const xp = Math.max(10, Math.round((quizScore ?? 50) / 10) * 5);
        await supabase.from("handwriting_academy_progress").upsert({
          user_id: user.id, lesson_id: lessonId, completed: true,
          quiz_score: quizScore, xp_earned: xp, completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
        return json({ ok: true, xp_earned: xp });
      }
      if (sub === "generate-quiz") {
        const { lessonId } = body;
        const content = await callAI({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Generate a 5-question multiple-choice graphology quiz. Return JSON: { questions: [{ q, options: [string,string,string,string], correct: 0-3 }] }." },
            { role: "user", content: `Lesson topic: ${lessonId}` },
          ],
          response_format: { type: "json_object" },
        });
        return json(JSON.parse(content));
      }
      const { data } = await supabase
        .from("handwriting_academy_progress").select("*").eq("user_id", user.id);
      return json({ progress: data ?? [] });
    }

    // ---------- VOICE DIARY (8 cr — voice + handwriting fingerprint) ----------
    if (action === "voice-diary") {
      const { handwritingImageUrl, voiceTranscript, voiceDurationSec = 0 } = body;
      if (!handwritingImageUrl || !voiceTranscript) {
        return json({ error: "handwritingImageUrl and voiceTranscript required" }, 400);
      }
      if ((voiceTranscript as string).length < 20) {
        return json({ error: "Voice transcript too short — record at least a few sentences." }, 400);
      }
      await chargeCredits(supabase, user.id, 8);

      const content = await callAI({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a hybrid voice-and-handwriting emotional fingerprint analyst. Compare the spoken words (transcript) with the handwriting sample to detect congruence between expressed and unconscious emotional state. Return strict JSON: { mood_score: 0-100, energy_score: 0-100, congruence_score: 0-100 (how much voice matches handwriting), emotional_fingerprint: { dominant_emotion, secondary_emotions: string[], stress_indicators: string[], hidden_signals: string[] }, ai_summary: 2-3 paragraph diary insight }.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Voice transcript (${voiceDurationSec}s):\n"${(voiceTranscript as string).slice(0, 4000)}"\n\nHandwriting sample below:` },
              { type: "image_url", image_url: { url: handwritingImageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase
        .from("voice_diaries")
        .insert({
          user_id: user.id,
          handwriting_image_url: handwritingImageUrl,
          voice_transcript: voiceTranscript,
          voice_duration_sec: voiceDurationSec,
          mood_score: parsed.mood_score,
          energy_score: parsed.energy_score,
          congruence_score: parsed.congruence_score,
          emotional_fingerprint: parsed.emotional_fingerprint,
          ai_analysis: parsed,
          ai_summary: parsed.ai_summary,
          credits_used: 8,
        })
        .select()
        .single();
      return json({ diary: row });
    }

    // ---------- HR BULK CANDIDATE (4 cr per candidate, requires HR Pro sub) ----------
    if (action === "hr-bulk-analyze") {
      const { candidateId } = body;
      if (!candidateId) return json({ error: "candidateId required" }, 400);

      const { data: hr } = await supabase
        .from("hr_pro_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!hr || hr.status !== "active") {
        return json({ error: "Active HR Pro subscription required" }, 403);
      }
      if ((hr.monthly_candidates_used ?? 0) >= (hr.monthly_candidate_quota ?? 500)) {
        return json({ error: "Monthly candidate quota reached" }, 402);
      }

      const { data: candidate } = await supabase
        .from("hr_bulk_candidates")
        .select("*, hr_bulk_jobs!inner(*)")
        .eq("id", candidateId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!candidate) return json({ error: "Candidate not found" }, 404);
      if (candidate.status === "completed") {
        return json({ candidate, alreadyDone: true });
      }

      await chargeCredits(supabase, user.id, 4);

      const job = (candidate as any).hr_bulk_jobs;
      const requiredTraits = (job?.required_traits ?? []).join(", ") || "leadership, communication, attention to detail, integrity";

      try {
        const content = await callAI({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an HR-grade graphology expert producing anonymized candidate scoring for ATS export. NEVER mention the candidate's identity, ethnicity, age, or gender. Score professionally and impartially. Return strict JSON: { leadership_score: 0-100, communication_score: 0-100, attention_score: 0-100, integrity_score: 0-100, overall_fit: 0-100, ai_summary: 2-paragraph anonymized professional assessment, ats_export: { strengths: string[], development_areas: string[], recommended_role_fit: string, hiring_recommendation: 'STRONG_HIRE'|'HIRE'|'MAYBE'|'NO_HIRE' } }.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Job: ${job?.job_title ?? "Unspecified"}\nRequired traits: ${requiredTraits}\nCandidate alias: ${candidate.candidate_alias}` },
                { type: "image_url", image_url: { url: candidate.image_url } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(content);

        const { data: updated } = await supabase
          .from("hr_bulk_candidates")
          .update({
            leadership_score: parsed.leadership_score,
            communication_score: parsed.communication_score,
            attention_score: parsed.attention_score,
            integrity_score: parsed.integrity_score,
            overall_fit: parsed.overall_fit,
            ai_summary: parsed.ai_summary,
            ats_export_data: parsed.ats_export,
            credits_used: 4,
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", candidateId)
          .select()
          .single();

        await supabase
          .from("hr_bulk_jobs")
          .update({
            completed_candidates: (job?.completed_candidates ?? 0) + 1,
            status: ((job?.completed_candidates ?? 0) + 1) >= (job?.total_candidates ?? 0) ? "completed" : "processing",
          })
          .eq("id", job.id);
        await supabase
          .from("hr_pro_subscriptions")
          .update({ monthly_candidates_used: (hr.monthly_candidates_used ?? 0) + 1 })
          .eq("id", hr.id);

        return json({ candidate: updated });
      } catch (err) {
        await supabase
          .from("hr_bulk_candidates")
          .update({ status: "failed", error_message: (err as Error).message })
          .eq("id", candidateId);
        throw err;
      }
    }

    // ---------- COUPLES TIMELINE (auto-recorded by Compatibility action when sub exists; 0 cr extra) ----------
    if (action === "couples-record-compatibility") {
      const { compatibilityScore, moodTrend, fullAnalysis, couplesSubscriptionId } = body;
      if (!couplesSubscriptionId || compatibilityScore === undefined) {
        return json({ error: "couplesSubscriptionId and compatibilityScore required" }, 400);
      }
      const { data: sub } = await supabase
        .from("couples_subscriptions")
        .select("id, partner_a_user_id, partner_b_user_id, status")
        .eq("id", couplesSubscriptionId)
        .maybeSingle();
      if (!sub || sub.status !== "active") return json({ error: "No active couples sub" }, 403);
      if (sub.partner_a_user_id !== user.id && sub.partner_b_user_id !== user.id) {
        return json({ error: "Not a member of this subscription" }, 403);
      }
      const { data: tl } = await supabase
        .from("couples_compatibility_timeline")
        .insert({
          couples_subscription_id: couplesSubscriptionId,
          compatibility_score: compatibilityScore,
          mood_trend: moodTrend ?? {},
          full_analysis: fullAnalysis ?? {},
        })
        .select()
        .single();
      return json({ timeline: tl });
    }

    // ---------- TIME-CAPSULE EVOLUTION DIFF (6 cr) ----------
    if (action === "capsule-diff") {
      const { entryAId, entryBId } = body;
      if (!entryAId || !entryBId) return json({ error: "entryAId and entryBId required" }, 400);
      if (entryAId === entryBId) return json({ error: "Pick two different entries" }, 400);
      const { data: entries } = await supabase
        .from("handwriting_time_capsule")
        .select("id, image_url, captured_at, label")
        .in("id", [entryAId, entryBId])
        .eq("user_id", user.id);
      if (!entries || entries.length !== 2) return json({ error: "Entries not found" }, 404);
      await chargeCredits(supabase, user.id, 6);
      const a = entries.find((e: any) => e.id === entryAId)!;
      const b = entries.find((e: any) => e.id === entryBId)!;
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a graphology evolution analyst. Compare TWO handwriting samples from the SAME PERSON taken at different points in time. Detect changes in slant, pressure, size, spacing, baseline, energy and emotional tone. Return strict JSON: { diff_summary: string, changes: { slant: string, pressure: string, size: string, spacing: string, baseline: string, energy: string }, emotional_shift: string, growth_score: -100..100, milestones: string[] }." },
          { role: "user", content: [
            { type: "text", text: `Sample A captured ${a.captured_at} (${a.label ?? "unlabeled"}).\nSample B captured ${b.captured_at} (${b.label ?? "unlabeled"}).` },
            { type: "image_url", image_url: { url: a.image_url } },
            { type: "image_url", image_url: { url: b.image_url } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_evolution_diffs").insert({
        user_id: user.id, entry_a_id: entryAId, entry_b_id: entryBId,
        diff_summary: parsed.diff_summary, changes: parsed.changes,
        emotional_shift: parsed.emotional_shift, growth_score: parsed.growth_score,
        credits_used: 6,
      }).select().single();
      return json({ diff: row, milestones: parsed.milestones ?? [] });
    }

    // ---------- LIVE INK STROKE ANALYSIS (4 cr) ----------
    if (action === "live-ink-analyze") {
      const { strokes, durationMs, pressureAvg, speedAvg } = body;
      if (!Array.isArray(strokes) || strokes.length === 0) {
        return json({ error: "strokes array required" }, 400);
      }
      await chargeCredits(supabase, user.id, 4);
      const strokeStats = {
        stroke_count: strokes.length,
        total_points: strokes.reduce((acc: number, s: any) => acc + (s.points?.length ?? 0), 0),
        avg_pressure: pressureAvg ?? 0.5,
        avg_speed: speedAvg ?? 0,
        duration_ms: durationMs ?? 0,
      };
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a real-time graphology analyst. From stroke statistics (no image), infer personality cues. Return JSON: { energy: 0-100, confidence: 0-100, focus: 0-100, creativity: 0-100, headline: short tagline, insight: 2-3 sentence reading }." },
          { role: "user", content: `Stroke metrics: ${JSON.stringify(strokeStats)}` },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const { data: row } = await supabase.from("handwriting_live_ink_recordings").insert({
        user_id: user.id, strokes, duration_ms: durationMs ?? 0,
        pressure_avg: pressureAvg ?? null, speed_avg: speedAvg ?? null,
        ai_reading: parsed, credits_used: 4,
      }).select().single();
      return json({ recording: row, reading: parsed });
    }

    // ---------- GALLERY MODERATE SUBMISSION (auto, free) ----------
    // Runs AI safety + auto-grades trait vector. Sets status to 'approved' or 'rejected'.
    if (action === "gallery-moderate") {
      const { itemId } = body;
      if (!itemId) return json({ error: "itemId required" }, 400);
      const { data: item } = await supabase
        .from("handwriting_gallery_items")
        .select("*")
        .eq("id", itemId)
        .eq("submitter_user_id", user.id)
        .maybeSingle();
      if (!item) return json({ error: "Item not found" }, 404);
      if (item.status !== "pending") return json({ error: "Already moderated" }, 400);

      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a museum curator + content safety officer. Decide if a user-submitted handwriting image belongs in a public graphology gallery. Reject if image contains: faces of identifiable people, nudity, hate symbols, copyrighted artwork (not handwriting), or non-handwriting content. Otherwise extract trait vector. Return strict JSON: { decision: 'approved'|'rejected', rejection_reason: string|null, ai_traits: { creativity:0-100, focus:0-100, energy:0-100, originality:0-100, emotion:0-100 }, suggested_tags: string[] }." },
          { role: "user", content: [
            { type: "text", text: `Figure: ${item.figure_name}. Story: ${item.story ?? "—"}. Era: ${item.era ?? "—"}.` },
            { type: "image_url", image_url: { url: item.image_url } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(content);
      const newStatus = parsed.decision === "approved" ? "approved" : "rejected";
      await supabase
        .from("handwriting_gallery_items")
        .update({
          status: newStatus,
          rejection_reason: parsed.rejection_reason ?? null,
          ai_traits: parsed.ai_traits ?? {},
          tags: parsed.suggested_tags ?? item.tags,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);
      return json({ status: newStatus, rejection_reason: parsed.rejection_reason ?? null, ai_traits: parsed.ai_traits });
    }

    // ---------- GALLERY TOUR GUIDE (3 cr per turn) ----------
    if (action === "gallery-tour") {
      const { itemId, message } = body;
      if (!itemId || !message) return json({ error: "itemId and message required" }, 400);
      if ((message as string).length > 500) return json({ error: "Message too long" }, 400);
      await chargeCredits(supabase, user.id, 3);
      const { data: item } = await supabase
        .from("handwriting_gallery_items")
        .select("figure_name, era, region, story, ai_traits, tags")
        .eq("id", itemId)
        .eq("status", "approved")
        .maybeSingle();
      if (!item) return json({ error: "Gallery item not found" }, 404);
      const { data: history } = await supabase
        .from("handwriting_gallery_tour_chats")
        .select("role, content")
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .order("created_at", { ascending: true })
        .limit(20);

      const systemPrompt = `You are a friendly museum tour guide who is also a graphologist. You're standing in front of the handwriting of ${item.figure_name} (${item.era ?? "unknown era"}, ${item.region ?? "unknown region"}). Background: ${item.story ?? ""}. AI trait vector: ${JSON.stringify(item.ai_traits)}. Speak warmly, briefly (max 120 words), and weave handwriting analysis into your answer.`;
      const messages: any[] = [{ role: "system", content: systemPrompt }];
      for (const m of history ?? []) messages.push({ role: m.role, content: m.content });
      messages.push({ role: "user", content: message });

      const reply = await callAI({ model: "gpt-4o", messages });

      await supabase.from("handwriting_gallery_tour_chats").insert([
        { user_id: user.id, item_id: itemId, role: "user", content: message },
        { user_id: user.id, item_id: itemId, role: "assistant", content: reply },
      ]);
      return json({ reply });
    }

    // ---------- PDF REPORT (5 cr) ----------
    if (action === "pdf-report") {
      const { analysisId, source = "main" } = body;
      if (!analysisId) return json({ error: "analysisId required" }, 400);
      await chargeCredits(supabase, user.id, 5);
      const tableMap: Record<string, string> = {
        main: "handwriting_analyses",
        signature: "handwriting_signature_analyses",
        forgery: "handwriting_forgery_checks",
        compatibility: "handwriting_compatibility_matches",
      };
      const tbl = tableMap[source] ?? "handwriting_analyses";
      const { data: analysis } = await supabase
        .from(tbl).select("*").eq("id", analysisId).eq("user_id", user.id).maybeSingle();
      if (!analysis) return json({ error: "Analysis not found" }, 404);
      const summary = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Write a forensic-grade executive summary for a handwriting analysis PDF report. Professional, court-ready tone, 250-400 words." },
          { role: "user", content: JSON.stringify(analysis).slice(0, 6000) },
        ],
      });
      const watermark = `UniqueApp Forensic · ${user.id.slice(0, 8)} · ${new Date().toISOString().slice(0, 10)}`;
      const { data: report } = await supabase.from("handwriting_pdf_reports").insert({
        user_id: user.id, source_analysis_id: analysisId, report_type: source,
        watermark, status: "ready", credits_used: 5,
      }).select().single();
      return json({ report, summary, watermark, source_data: analysis });
    }

    // ============================================================
    // PARITY PACK — 8 specialized tools, 6 credits each
    // ============================================================
    const PARITY_COST = 6;
    const visionAsk = async (sys: string, userText: string, imageUrl: string) => {
      const content = await callAI({
        model: "gpt-4o",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
        ],
        response_format: { type: "json_object" },
      });
      return JSON.parse(content);
    };

    if (action === "zone-analysis") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a graphologist specializing in zonal analysis (upper=intellect/spirit, middle=daily ego, lower=physical/drives). Return strict JSON: { upper_zone: { size, slant, traits: string[] }, middle_zone: { size, pressure, traits: string[] }, lower_zone: { size, loops, traits: string[] }, dominant_zone: 'upper'|'middle'|'lower', ai_summary: string }.",
        "Perform a zonal breakdown of this handwriting.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_zone_analyses").insert({
        user_id: user.id, image_url: imageUrl,
        upper_zone: parsed.upper_zone, middle_zone: parsed.middle_zone, lower_zone: parsed.lower_zone,
        dominant_zone: parsed.dominant_zone, ai_summary: parsed.ai_summary, credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "letter-decoder") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a letter-by-letter graphology decoder. Identify 6-10 distinctive letters in the sample and decode each. Return strict JSON: { letters: [{ letter, observation, meaning }], ai_summary: string }.",
        "Decode individual letters in this sample.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_letter_decoder").insert({
        user_id: user.id, image_url: imageUrl,
        letters: parsed.letters ?? [], ai_summary: parsed.ai_summary, credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "career-match") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a graphology career advisor. Suggest careers that fit this handwriting. Return strict JSON: { top_careers: [{ role, fit_score, reason }], avoid_careers: [{ role, reason }], reasoning: string }.",
        "Match careers to this handwriting.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_career_matches").insert({
        user_id: user.id, image_url: imageUrl,
        top_careers: parsed.top_careers ?? [], avoid_careers: parsed.avoid_careers ?? [],
        reasoning: parsed.reasoning, credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "health-screen") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a graphology wellness screener (educational only, NOT medical). Estimate tremor, micrographia (shrinking), and fatigue indicators 0-100. Return strict JSON: { tremor_score, micrographia_score, fatigue_score, flags: string[], disclaimer: string, ai_summary: string }.",
        "Screen this handwriting for physical wellness signals.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_health_screens").insert({
        user_id: user.id, image_url: imageUrl,
        tremor_score: parsed.tremor_score, micrographia_score: parsed.micrographia_score,
        fatigue_score: parsed.fatigue_score, flags: parsed.flags ?? [],
        disclaimer: parsed.disclaimer ?? "Educational tool, not a medical diagnosis.",
        ai_summary: parsed.ai_summary, credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "mental-screen") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a graphology mental-wellness screener (educational only, NOT clinical). Rate anxiety, depression, burnout and resilience 0-100. Return strict JSON: { anxiety_score, depression_score, burnout_score, resilience_score, recommendations: string[], ai_summary: string }.",
        "Screen this handwriting for emotional resilience signals.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_mental_screens").insert({
        user_id: user.id, image_url: imageUrl,
        anxiety_score: parsed.anxiety_score, depression_score: parsed.depression_score,
        burnout_score: parsed.burnout_score, resilience_score: parsed.resilience_score,
        recommendations: parsed.recommendations ?? [], ai_summary: parsed.ai_summary,
        credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "coach-plan") {
      const { imageUrl, goal } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a handwriting improvement coach. Given a sample and a goal, design a 7-day practice plan. Return strict JSON: { exercises: [{ day, title, instruction, duration_min }], ai_plan: string }.",
        `Goal: ${goal ?? "general improvement"}. Build a 7-day plan.`,
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_coach_sessions").insert({
        user_id: user.id, before_image_url: imageUrl, goal: goal ?? null,
        exercises: parsed.exercises ?? [], ai_plan: parsed.ai_plan, credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "forensic-profile") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a forensic profiler estimating writer attributes from handwriting alone. Be careful and probabilistic — never assert identity. Return strict JSON: { estimated_age_range, estimated_handedness, estimated_gender_tendency, personality_summary, behavioral_markers: string[], confidence: 0-100, disclaimer: string }.",
        "Build a forensic profile of the unknown writer.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_forensic_profiles").insert({
        user_id: user.id, image_url: imageUrl,
        estimated_age_range: parsed.estimated_age_range,
        estimated_handedness: parsed.estimated_handedness,
        estimated_gender_tendency: parsed.estimated_gender_tendency,
        personality_summary: parsed.personality_summary,
        behavioral_markers: parsed.behavioral_markers ?? [],
        confidence: parsed.confidence,
        disclaimer: parsed.disclaimer ?? "Probabilistic estimate, not identification.",
        credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    if (action === "cultural-match") {
      const { imageUrl } = body;
      if (!imageUrl) return json({ error: "imageUrl required" }, 400);
      await chargeCredits(supabase, user.id, PARITY_COST);
      const parsed = await visionAsk(
        "You are a paleography / cultural-handwriting expert. Match this script to historical/national handwriting traditions (e.g. Palmer, Spencerian, D'Nealian, Italic, Sütterlin, French cursive, Cyrillic schoolbook, Japanese romaji). Return strict JSON: { matched_styles: [{ style, similarity }], primary_style, era_estimate, ai_summary }.",
        "Identify cultural/era influences in this handwriting.",
        imageUrl,
      );
      const { data: row } = await supabase.from("handwriting_cultural_matches").insert({
        user_id: user.id, image_url: imageUrl,
        matched_styles: parsed.matched_styles ?? [], primary_style: parsed.primary_style,
        era_estimate: parsed.era_estimate, ai_summary: parsed.ai_summary, credits_used: PARITY_COST,
      }).select().single();
      return json({ result: row });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[handwriting-ai]", msg);
    const status = msg.includes("Insufficient") ? 402
      : msg.includes("Rate limited") ? 429
      : msg.includes("AI credits") ? 402
      : msg.includes("Unauthorized") ? 401 : 500;
    return json({ error: msg }, status);
  }
});
