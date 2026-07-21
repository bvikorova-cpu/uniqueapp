// AI-powered brand deal generator for InfluKing.
// Uses OpenAI (gpt-4o-mini) to produce 6 tailored brand deal opportunities
// based on the caller's influencer profile. Deducts 3 AI credits per call.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COST = 3;
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You generate realistic (but fictional) brand-deal opportunities for social media influencers.
Return STRICT JSON: {"deals":[{"brand":"...","logo":"single emoji","category":"one of: Fitness & Health, Technology, Travel, Fashion & Beauty, Education, Gaming, Food & Cooking, Lifestyle","budget":"€X - €Y","requirements":"short min follower + niche","description":"2-3 sentences campaign brief","deadline":"YYYY-MM-DD (within next 60 days)","deal_type":"one of: Sponsored Post, Product Review, Brand Ambassador, Challenge Campaign, Affiliate Partnership, Sponsored Stream"}]}
Produce exactly 6 diverse deals. Match budgets to the influencer's follower tier. No preamble.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "generate";

    // ---- LIST: return active + user-owned deals, free ----
    if (action === "list") {
      const { data, error } = await admin
        .from("influking_brand_deals")
        .select("*")
        .or(`generated_for.eq.${user.id},generated_for.is.null,is_active.eq.true`)
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      const { data: apps } = await admin
        .from("influking_brand_deal_applications")
        .select("deal_id")
        .eq("user_id", user.id);
      return new Response(
        JSON.stringify({ deals: data ?? [], appliedDealIds: (apps ?? []).map((a: any) => a.deal_id) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- APPLY ----
    if (action === "apply") {
      const dealId = body.dealId as string;
      const pitch = String(body.pitch ?? "").trim();
      if (!dealId || pitch.length < 20) throw new Error("Deal id and pitch (min 20 chars) required");
      const { error } = await admin.from("influking_brand_deal_applications").insert({
        deal_id: dealId, user_id: user.id, pitch,
      });
      if (error) {
        if (error.code === "23505") throw new Error("You already applied to this deal");
        throw error;
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- GENERATE (AI, costs credits) ----
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");

    const { data: profile } = await admin
      .from("influencer_profiles")
      .select("display_name, category, followers_count, bio")
      .eq("user_id", user.id)
      .maybeSingle();

    const followers = profile?.followers_count ?? 5000;
    const category = profile?.category ?? body.category ?? "Lifestyle";
    const bio = profile?.bio ?? "";

    // Pre-flight credit check
    const { data: creditsRow } = await admin
      .from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    const current = creditsRow?.credits_remaining ?? 0;
    if (current < CREDIT_COST) {
      return new Response(
        JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: CREDIT_COST, available: current }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = `Influencer profile:
- Category / niche: ${category}
- Followers: ${followers.toLocaleString()}
- Bio: ${bio || "n/a"}

Generate 6 tailored brand deal opportunities matching this profile.`;

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!ai.ok) {
      const errText = await ai.text();
      console.error("OpenAI error", ai.status, errText);
      if (ai.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please retry shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`OpenAI failed: ${ai.status}`);
    }

    const raw = await ai.json();
    const content = raw.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { parsed = null; }
    const deals = Array.isArray(parsed?.deals) ? parsed.deals : [];
    if (deals.length === 0) throw new Error("AI returned no deals");

    // Deduct credits AFTER successful AI call
    const spend = await spendAiCredits(admin, user.id, CREDIT_COST, "brand_deal_finder", "edge_function");
    if (!spend.ok) {
      return new Response(JSON.stringify({ error: spend.error ?? "credit_spend_failed" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert deals
    const rows = deals.slice(0, 8).map((d: any) => ({
      generated_for: user.id,
      brand: String(d.brand ?? "Brand").slice(0, 120),
      logo: String(d.logo ?? "💼").slice(0, 8),
      category: String(d.category ?? category).slice(0, 60),
      budget: String(d.budget ?? "€500 - €2,000").slice(0, 60),
      requirements: String(d.requirements ?? "").slice(0, 200),
      description: String(d.description ?? "").slice(0, 600),
      deadline: (d.deadline && /^\d{4}-\d{2}-\d{2}$/.test(d.deadline))
        ? d.deadline
        : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      deal_type: String(d.deal_type ?? "Sponsored Post").slice(0, 60),
      is_active: true,
    }));

    const { data: inserted, error: insErr } = await admin
      .from("influking_brand_deals").insert(rows).select("*");
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ deals: inserted, creditsUsed: CREDIT_COST, creditsRemaining: spend.remaining }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("brand-deal-finder error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
