import "../_shared/aiRedirect.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const BRAND_DEAL_COST = 3;
const BRAND_DEAL_PROMPT = `You generate realistic but fictional brand-deal opportunities for social media influencers.
Return strict JSON: {"deals":[{"brand":"...","logo":"single emoji","category":"Fitness & Health, Technology, Travel, Fashion & Beauty, Education, Gaming, Food & Cooking, or Lifestyle","budget":"€X - €Y","requirements":"short minimum follower and niche requirement","description":"2-3 sentence campaign brief","deadline":"YYYY-MM-DD within the next 60 days","deal_type":"Sponsored Post, Product Review, Brand Ambassador, Challenge Campaign, Affiliate Partnership, or Sponsored Stream"}]}.
Produce exactly 6 diverse deals, use EUR exclusively, match budgets to the follower tier, and include no preamble.`;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getSystemPrompt(action: string): string {
  const prompts: Record<string, string> = {
    "content-calendar": "You are a social media content strategist. Generate a detailed content calendar. Return JSON array with objects: { day, title, description, type (Post/Reel/Story/Video), hashtags }.",
    "brand-deals": "You are a brand partnership matchmaker. Generate realistic brand deal opportunities. Return JSON array with objects: { brand, description, payout (e.g. '$500-$2000'), type (Sponsored Post/Story/Campaign/Ambassador), match_score }.",
    "trend-analysis": "You are a social media trend analyst. Analyze current trends. Return JSON with: { trending_topics: string[], hashtags: string[], recommendations: string[] }.",
    "battle": "You are a content battle judge. Compare two influencers. Return JSON with: { winner, summary, player1_stats: { creativity, engagement, consistency, virality, brand_appeal }, player2_stats: same, rounds: [{ category, result }] }.",
    "caption": "You are a viral caption writer. Write 5 engaging captions for the described content. Return as plain text, numbered.",
    "hashtags": "You are a hashtag researcher. Generate 30 optimized hashtags grouped by reach. Return as plain text with sections: High Reach, Medium Reach, Niche.",
    "content-ideas": "You are a content ideation expert. Generate 10 viral content ideas. Return as plain text, numbered with format and platform suggestions.",
    "audience-insight": "You are an audience analyst. Provide detailed audience demographics and behavior insights. Return as plain text with sections.",
    "engagement-boost": "You are an engagement optimization expert. Provide 10 actionable strategies to boost engagement. Return as plain text, numbered.",
    "competitor-spy": "You are a competitive intelligence analyst. Analyze the described competitors. Return as plain text with strategies, strengths, and weaknesses.",
    "reply-gen": "You are a social media manager. Generate 5 on-brand reply options for the given comment/DM. Return as plain text, numbered.",
    "script-writer": "You are a video scriptwriter. Write an engaging script with hook, body, and CTA. Return as plain text with timestamps.",
    "brand-voice": "You are a brand strategist. Define a comprehensive brand voice guide. Return as plain text with tone, vocabulary, do's and don'ts.",
    "media-kit": "You are a media kit designer. Generate a professional media kit text layout. Return as plain text with sections: About, Stats, Services, Rates, Past Collaborations.",
    "crisis-manager": "You are a PR crisis manager. Analyze the situation and provide a response strategy. Return as plain text with Assessment, Response Draft, and Next Steps.",
    "collab-finder": "You are a collaboration matchmaker. Suggest 5 ideal collaboration partners. Return as plain text with Name, Why They Match, Collaboration Idea." };
  return prompts[action] || "You are a helpful social media AI assistant. Provide detailed, actionable advice.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const body = await req.json();
    const { action } = body;

    // Brand Deal Finder is consolidated here to stay below the Edge Function limit.
    if (action === "brand-deal-finder") {
      const operation = body.operation ?? "generate";

      if (operation === "list") {
        const { data: deals, error: dealsError } = await supabase
          .from("influking_brand_deals")
          .select("*")
          .or(`generated_for.eq.${user.id},generated_for.is.null,is_active.eq.true`)
          .order("created_at", { ascending: false })
          .limit(24);
        if (dealsError) throw dealsError;
        const { data: applications, error: applicationsError } = await supabase
          .from("influking_brand_deal_applications")
          .select("deal_id")
          .eq("user_id", user.id);
        if (applicationsError) throw applicationsError;
        return jsonResponse({
          deals: deals ?? [],
          appliedDealIds: (applications ?? []).map((application: { deal_id: string }) => application.deal_id),
        });
      }

      if (operation === "apply") {
        const dealId = typeof body.dealId === "string" ? body.dealId : "";
        const pitch = typeof body.pitch === "string" ? body.pitch.trim() : "";
        if (!dealId || pitch.length < 20) return jsonResponse({ error: "Deal id and pitch (min 20 chars) required" }, 400);
        const { error: applicationError } = await supabase
          .from("influking_brand_deal_applications")
          .insert({ deal_id: dealId, user_id: user.id, pitch });
        if (applicationError?.code === "23505") return jsonResponse({ error: "You already applied to this deal" }, 409);
        if (applicationError) throw applicationError;
        return jsonResponse({ ok: true });
      }

      const { data: profile } = await supabase
        .from("influencer_profiles")
        .select("category, followers_count, bio")
        .eq("user_id", user.id)
        .maybeSingle();
      const category = profile?.category ?? "Lifestyle";
      const followers = profile?.followers_count ?? 5000;
      const prompt = `Influencer niche: ${category}\nFollowers: ${followers}\nBio: ${profile?.bio || "n/a"}\nGenerate 6 tailored opportunities.`;

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer vertex-ai", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: BRAND_DEAL_PROMPT },
            { role: "user", content: prompt },
          ],
          max_completion_tokens: 3000,
        }),
      });
      if (!aiResponse.ok) throw new Error("AI generation is temporarily unavailable");
      const aiData = await aiResponse.json();
      const content = aiData?.choices?.[0]?.message?.content ?? "{}";
      let parsed: { deals?: Record<string, unknown>[] } = {};
      try { parsed = JSON.parse(content); } catch { throw new Error("AI returned an invalid response"); }
      const generatedDeals = Array.isArray(parsed.deals) ? parsed.deals.slice(0, 6) : [];
      if (generatedDeals.length === 0) throw new Error("AI returned no deals");

      const { data: remaining, error: creditError } = await supabase.rpc("deduct_ai_credits_atomic", {
        _user_id: user.id,
        _amount: BRAND_DEAL_COST,
      });
      if (creditError) {
        if (creditError.message.includes("INSUFFICIENT_CREDITS")) {
          return jsonResponse({ error: "INSUFFICIENT_CREDITS", required: BRAND_DEAL_COST }, 402);
        }
        throw creditError;
      }

      const rows = generatedDeals.map((deal) => ({
        generated_for: user.id,
        brand: String(deal.brand ?? "Brand").slice(0, 120),
        logo: String(deal.logo ?? "💼").slice(0, 8),
        category: String(deal.category ?? category).slice(0, 60),
        budget: String(deal.budget ?? "€500 - €2,000").slice(0, 60),
        requirements: String(deal.requirements ?? "").slice(0, 200),
        description: String(deal.description ?? "").slice(0, 600),
        deadline: typeof deal.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(deal.deadline)
          ? deal.deadline
          : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        deal_type: String(deal.deal_type ?? "Sponsored Post").slice(0, 60),
        is_active: true,
      }));
      const { data: inserted, error: insertError } = await supabase
        .from("influking_brand_deals")
        .insert(rows)
        .select("*");
      if (insertError) {
        await supabase.rpc("refund_ai_credits_atomic", { _user_id: user.id, _amount: BRAND_DEAL_COST });
        throw insertError;
      }
      return jsonResponse({ deals: inserted ?? [], creditsUsed: BRAND_DEAL_COST, creditsRemaining: remaining });
    }

    // Check credits for the legacy InfluKing AI actions.
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < 3) {
      return new Response(JSON.stringify({ error: "Insufficient credits. Please purchase more credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const systemPrompt = getSystemPrompt(action);

    let userMessage = "";
    switch (action) {
      case "content-calendar":
        userMessage = `Create a ${body.days}-day content calendar for the ${body.niche} niche.`;
        break;
      case "brand-deals":
        userMessage = `Find brand deal opportunities for a ${body.niche} influencer with ${body.followers} followers.`;
        break;
      case "trend-analysis":
        userMessage = `Analyze current trends on ${body.platform} for the ${body.niche} niche.`;
        break;
      case "battle":
        userMessage = `Battle between "${body.player1}" and "${body.player2}". Judge them on content quality, creativity, engagement potential, consistency, and virality.`;
        break;
      default:
        userMessage = body.input || "Provide general social media advice.";
    }

    const creditsUsed = ["brand-deals", "trend-analysis", "battle", "audience-insight", "competitor-spy", "script-writer", "brand-voice", "media-kit", "crisis-manager", "collab-finder", "content-calendar"].includes(action) ? 5 : 3;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer vertex-ai", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 2000 }) });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const text = aiData.choices[0]?.message?.content || "";

    // Deduct credits
    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - creditsUsed }).eq("user_id", user.id);

    // Try to parse JSON responses
    let result: any = { result: text };
    if (["content-calendar", "brand-deals", "trend-analysis", "battle"].includes(action)) {
      try {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/) || text.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (action === "content-calendar") result = { calendar: Array.isArray(parsed) ? parsed : parsed.calendar || [] };
          else if (action === "brand-deals") result = { deals: Array.isArray(parsed) ? parsed : parsed.deals || [] };
          else result = parsed;
        }
      } catch { /* keep text result */ }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error:", error);
    const status = error.message?.includes("Insufficient") ? 402 : error.message?.includes("authenticated") ? 401 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
