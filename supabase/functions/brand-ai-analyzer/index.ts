import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COSTS: Record<string, number> = {
  audit: 5,
  competitor: 4,
  sentiment: 3,
  market_outlook: 4,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { brandId, insightType } = await req.json();
    if (!brandId || !insightType) throw new Error("brandId and insightType required");

    const cost = COSTS[insightType] ?? 5;

    // Charge brand votes credits (reuse existing votes credit pool)
    const { data: votes } = await adminClient
      .from("brand_votes")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!votes || (votes.purchased_votes ?? 0) < cost) {
      return new Response(JSON.stringify({
        error: "Not enough credits. Buy more votes to unlock AI insights.",
        required: cost,
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get brand
    const { data: brand } = await adminClient
      .from("brand_sponsors").select("*").eq("id", brandId).single();
    if (!brand) throw new Error("Brand not found");

    // Get stock data
    const { data: stock } = await adminClient
      .from("brand_stock_prices").select("*").eq("brand_id", brandId).maybeSingle();

    const prompts: Record<string, string> = {
      audit: `You are a senior brand strategist. Generate a complete brand audit for "${brand.name}" (category: ${brand.category}, tier: ${brand.tier}, total community votes: ${brand.total_votes}). Cover: 1) Brand positioning strengths, 2) Weaknesses & risks, 3) Competitive moat, 4) Growth opportunities, 5) Recommended next 90-day actions. Be sharp, executive-level, and specific.`,
      competitor: `Analyze the competitive landscape for "${brand.name}" in the ${brand.category} category. Identify likely top competitors, compare positioning, and recommend a differentiation strategy. Use real-world frameworks (Porter's 5 Forces, Blue Ocean).`,
      sentiment: `Estimate brand sentiment for "${brand.name}". With ${brand.total_votes} community votes and current stock value €${stock?.current_price ?? 100}, infer how the public perceives the brand. Provide: positive themes, negative themes, neutral themes, sentiment score (0-100), and three quotes a typical fan/critic might say.`,
      market_outlook: `Provide a 12-month market outlook for "${brand.name}" in ${brand.category}. Include: market trends, projected growth %, key risks, opportunities, and a recommended investment thesis.`,
    };

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a world-class brand intelligence analyst. Output structured, executive-grade reports." },
          { role: "user", content: prompts[insightType] },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted on workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("OpenAI API error " + aiResp.status);
    }

    const aiData = await aiResp.json();
    const summary = aiData.choices?.[0]?.message?.content ?? "No content";

    // Charge user
    await adminClient.from("brand_votes")
      .update({ purchased_votes: (votes.purchased_votes ?? 0) - cost })
      .eq("user_id", user.id);

    // Store insight
    const titleMap: Record<string, string> = {
      audit: "Full Brand Audit",
      competitor: "Competitor Landscape",
      sentiment: "Sentiment Deep Dive",
      market_outlook: "12-Month Market Outlook",
    };

    const { data: insert } = await adminClient.from("brand_ai_insights").insert({
      user_id: user.id,
      brand_id: brandId,
      insight_type: insightType,
      title: `${titleMap[insightType]} — ${brand.name}`,
      summary,
      full_report: { generated_at: new Date().toISOString(), model: "gpt-4o-mini" },
      credits_charged: cost,
    }).select().single();

    return new Response(JSON.stringify({ success: true, insight: insert, charged: cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("brand-ai-analyzer error:", e);
    return new Response(JSON.stringify({ error: e.message ?? "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
