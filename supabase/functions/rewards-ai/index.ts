import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  xp_optimizer: 4,
  badge_predictor: 4,
  challenge_generator: 5,
  reward_analyst: 5,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const creditCost = CREDIT_COSTS[action] || 5;

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < creditCost) {
      return new Response(JSON.stringify({ error: `Insufficient credits. Need ${creditCost}, have ${remaining}. Purchase more credits to continue.` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "xp_optimizer":
        systemPrompt = "You are a gamification strategist and XP optimization expert. You analyze user activity patterns and create detailed, actionable plans to maximize XP earnings and level progression. You understand reward psychology and engagement mechanics deeply.";
        userPrompt = `Create a personalized XP optimization strategy:

Current Level: ${params.current_level || "1"}
Current XP: ${params.current_xp || "0"}
Target Level: ${params.target_level || "10"}
Daily Activity Hours: ${params.daily_hours || "1-2 hours"}
Preferred Activities: ${params.activities || "Posting, commenting, liking"}
Current Streak: ${params.streak || "0 days"}
Badges Earned: ${params.badges || "0"}

Provide:
1. **XP Gap Analysis** — How much XP needed and estimated time to reach target
2. **Daily XP Blueprint** — Hour-by-hour activity plan for maximum XP per session
3. **High-Value Activities** — Top 10 activities ranked by XP/minute efficiency
4. **Streak Strategy** — How to maintain and leverage streaks for XP multipliers
5. **Badge Hunting Plan** — Which badges to target first for bonus XP
6. **Weekly Milestones** — Checkpoints to track your progress
7. **Hidden XP Boosters** — Lesser-known activities that give extra XP
8. **Optimal Timing** — Best times to be active for challenge bonuses
9. **Level-Up Forecast** — Week-by-week projection to target level`;
        break;

      case "badge_predictor":
        systemPrompt = "You are a badge analytics expert and achievement prediction specialist. You analyze user behavior patterns and predict which badges and achievements users are closest to unlocking, providing specific actions to complete them faster.";
        userPrompt = `Predict my next badge unlocks and create an achievement plan:

Current Badges: ${params.current_badges || "None listed"}
Activity Summary: ${params.activity_summary || "Regular posting and commenting"}
Total Posts: ${params.total_posts || "Not specified"}
Total Comments: ${params.total_comments || "Not specified"}
Login Streak: ${params.login_streak || "0"}
Level: ${params.level || "1"}
Special Activities: ${params.special_activities || "None"}

Provide:
1. **Next 5 Badges Prediction** — Badges you're closest to with % completion estimate
2. **Quick Wins** — 3 badges you can unlock TODAY with specific actions
3. **Weekly Targets** — 5 badges achievable this week with step-by-step plans
4. **Rare Badge Strategy** — How to unlock rare/epic/legendary badges
5. **Badge Combo Efficiency** — Activities that progress multiple badges simultaneously
6. **Hidden Badges** — Secret badges and hints on how to discover them
7. **Badge Collection Score** — Rate your collection completeness (1-100)
8. **Priority Ranking** — Which badges to focus on for maximum XP reward
9. **Seasonal Badges Alert** — Time-limited badges about to expire`;
        break;

      case "challenge_generator":
        systemPrompt = "You are a gamification designer and challenge creation expert. You create personalized, engaging challenges tailored to user skill levels and interests that drive meaningful engagement while being achievable and rewarding. Your challenges are creative, fun, and progressive.";
        userPrompt = `Generate personalized challenges for me:

Skill Level: ${params.skill_level || "Intermediate"}
Preferred Activities: ${params.preferred_activities || "Social engagement"}
Available Time: ${params.available_time || "30 minutes daily"}
Motivation Style: ${params.motivation_style || "Achievement-driven"}
Current Streak: ${params.streak || "0"}
Level: ${params.level || "1"}
Challenge History: ${params.challenge_history || "None completed yet"}

Generate:
1. **3 Daily Micro-Challenges** — Quick 5-10 minute tasks with immediate rewards (25-50 XP each)
2. **3 Weekly Power Challenges** — Medium difficulty requiring sustained effort (100-300 XP each)
3. **1 Epic Monthly Challenge** — Ambitious goal with legendary reward (500-1000 XP)
4. **1 Social Challenge** — Requires collaboration or community interaction
5. **1 Creative Challenge** — Pushes creative boundaries with unique content
6. **Challenge Difficulty Scaling** — How challenges increase as you level up
7. **Bonus Modifiers** — Special conditions that multiply XP (speed bonus, streak bonus, perfect score)
8. **Challenge Chain** — 5 linked challenges where completing one unlocks the next
9. **Reward Preview** — Detailed description of what you earn from each challenge`;
        break;

      case "reward_analyst":
        systemPrompt = "You are a rewards analytics expert and engagement optimization consultant. You analyze reward history, spending patterns, and activity data to provide comprehensive insights and recommendations for maximizing value from the rewards system.";
        userPrompt = `Analyze my rewards profile and provide insights:

Level: ${params.level || "1"}
Total XP Earned: ${params.total_xp || "0"}
XP This Month: ${params.monthly_xp || "0"}
Badges Collected: ${params.badges || "0"}
Total Badges Available: ${params.total_badges || "50"}
Login Streak Record: ${params.best_streak || "0"}
Rewards Claimed: ${params.rewards_claimed || "0"}
Premium Store Purchases: ${params.store_purchases || "None"}
Active Days: ${params.active_days || "Not specified"}

Provide comprehensive analysis:
1. **Reward Health Score** — Overall rating (1-100) with breakdown
2. **XP Earning Trends** — Monthly/weekly patterns and growth trajectory
3. **Activity Efficiency Report** — ROI analysis of time spent vs XP earned
4. **Badge Collection Analysis** — Completion percentage by rarity tier
5. **Streak Performance** — Consistency score and improvement suggestions
6. **Missed Opportunities** — XP and rewards you could have earned
7. **Comparison Benchmark** — How you compare to top 10%, median, and average users
8. **Optimization Recommendations** — Top 10 actionable tips ranked by impact
9. **30-Day Projection** — Expected XP, level, and badges if you follow recommendations
10. **Premium Value Assessment** — Whether premium store items are worth your XP`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    if (!result) throw new Error("No AI response");

    await supabase.from("ai_credits").update({ credits_remaining: remaining - creditCost }).eq("user_id", user.id);
    await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: `rewards_${action}`, credits_used: creditCost, description: `Rewards AI: ${action}` });

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("rewards-ai error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
