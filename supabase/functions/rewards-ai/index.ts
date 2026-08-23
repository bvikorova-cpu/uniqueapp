import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const CREDIT_COSTS: Record<string, number> = { xp_optimizer: 4,
  badge_predictor: 4,
  challenge_generator: 5,
  reward_analyst: 5,
  streak_coach: 4,
  gift_xp: 3,
  achievement_showcase: 4,
  xp_betting: 5,
  mystery_badges: 5,
  reward_marketplace: 4 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!openaiKey) throw new Error("LOVABLE_API_KEY not configured");

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
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "xp_optimizer":
        systemPrompt = "You are a gamification strategist and XP optimization expert for the Unique platform. Write a rich, detailed, practical plan in English. Use markdown headings, short paragraphs and tables where useful. Never invent XP thresholds: use ONLY the official table given to you. Be concrete with numbers, and always finish every section you start.";
        userPrompt = `Create a deep, personalized XP optimization strategy.

USER DATA
- Current Level: ${params.current_level || "1"}
- Current XP: ${params.current_xp || "0"}
- Target Level: ${params.target_level || "10"}
- Daily time available: ${params.daily_hours || "1-2 hours"}
- Preferred activities: ${params.activities || "Posting, commenting, liking"}

OFFICIAL XP FACTS (use exactly these, do not assume others)
- Level formula: level N requires (N-1) * 100 XP cumulative (L1=0, L2=100, L3=200, L4=300, L5=400, L10=900, L20=1900).
- Typical XP rewards: daily login 10-140 XP (calendar, grows with streak), create post 10 XP, comment 3 XP, like 1 XP, win Brain Duel 25 XP, complete AI tool run 5 XP, referral 100 XP, challenge win bonus (locked XP).
- 10,000 XP = 1 AI credit in the XP converter. XP earned in Eco/Healthy Challenges is LOCKED and cannot be converted.
- Streak freeze protects the login streak (max 1 use per 7 days).

DELIVER ALL SECTIONS, fully written out:
1. **XP Gap Analysis** — exact XP still needed to the target level, using the official formula (show the arithmetic).
2. **Daily XP Blueprint** — a realistic day-by-day routine that fits the available time, with per-activity XP and a daily total.
3. **High-Value Activities** — table ranked by XP per minute (activity | XP | est. minutes | XP/min).
4. **Weekly Plan** — Monday-Sunday table with focus, actions and expected weekly XP total.
5. **Streak Strategy** — how to maximize the login calendar, when to use a freeze, streak milestones.
6. **Badge & Achievement Plan** — which badges to chase first and how to unlock them.
7. **Battle Pass & Leagues** — how this routine also moves the Genesis battle pass tiers and the league ranking.
8. **Hidden XP Boosters** — underused platform actions worth extra XP.
9. **Level-Up Forecast** — table: level | cumulative XP needed | estimated date at your pace.
10. **Credits Outlook** — how long until the routine earns 10,000 XP (= 1 credit) and what to spend it on.
11. **Mistakes To Avoid** — 5 traps that waste time or lock XP.
12. **Action Checklist** — 10 concrete steps for the next 7 days.`;

        break;

      case "badge_predictor":
        systemPrompt = "You are a badge analytics expert and achievement prediction specialist.";
        userPrompt = `Predict my next badge unlocks:\n\nCurrent Badges: ${params.current_badges || "None"}\nActivity: ${params.activity_summary || "Regular posting"}\nPosts: ${params.total_posts || "?"}\nComments: ${params.total_comments || "?"}\nStreak: ${params.login_streak || "0"}\n\nProvide:\n1. **Next 5 Badges** with % completion\n2. **Quick Wins** — 3 badges unlockable TODAY\n3. **Weekly Targets**\n4. **Rare Badge Strategy**\n5. **Badge Combo Efficiency**\n6. **Hidden Badges**\n7. **Priority Ranking**`;
        break;

      case "challenge_generator":
        systemPrompt = "You are a gamification designer creating personalized, engaging challenges.";
        userPrompt = `Generate challenges:\n\nSkill: ${params.skill_level || "Intermediate"}\nActivities: ${params.preferred_activities || "Social"}\nTime: ${params.available_time || "30 min"}\nMotivation: ${params.motivation_style || "Achievement-driven"}\n\nGenerate:\n1. **3 Daily Micro-Challenges** (25-50 XP)\n2. **3 Weekly Power Challenges** (100-300 XP)\n3. **1 Epic Monthly Challenge** (500-1000 XP)\n4. **1 Social Challenge**\n5. **1 Creative Challenge**\n6. **Challenge Chain** — 5 linked challenges\n7. **Reward Preview**`;
        break;

      case "reward_analyst":
        systemPrompt = "You are a rewards analytics expert and engagement optimization consultant.";
        userPrompt = `Analyze rewards profile:\n\nLevel: ${params.level || "1"}\nTotal XP: ${params.total_xp || "0"}\nMonthly XP: ${params.monthly_xp || "0"}\nBadges: ${params.badges || "0"}\nBest Streak: ${params.best_streak || "0"}\nActive Days: ${params.active_days || "?"}\n\nProvide:\n1. **Reward Health Score** (1-100)\n2. **XP Earning Trends**\n3. **Activity Efficiency Report**\n4. **Badge Collection Analysis**\n5. **Optimization Recommendations** (Top 10)\n6. **30-Day Projection**`;
        break;

      case "streak_coach":
        systemPrompt = "You are a streak psychology expert and daily motivation coach. Create personalized streak maintenance plans with motivational messages, recovery strategies, and habit formation techniques.";
        userPrompt = `Create a streak coaching plan:\n\nCurrent Streak: ${params.current_streak || "0"} days\nBest Streak: ${params.best_streak || "0"} days\nPeak Activity Time: ${params.timezone || "Not specified"}\nBiggest Challenge: ${params.challenge_areas || "Not specified"}\n\nProvide:\n1. **Streak Health Assessment** — Current streak status and risk analysis\n2. **Daily Motivation Message** — Personalized motivational quote and pep talk\n3. **Streak Protection Plan** — 5 strategies to never break your streak\n4. **Recovery Protocol** — What to do if you miss a day (streak save mechanics)\n5. **Habit Stacking Blueprint** — Link streak activities to existing daily habits\n6. **Milestone Rewards Map** — What you unlock at 7, 14, 30, 60, 100 day streaks\n7. **Accountability System** — Social features and reminders to keep you on track\n8. **Streak Multiplier Strategy** — How longer streaks multiply your XP earnings\n9. **Emergency Backup Plan** — Quick 2-minute actions that count for streak maintenance\n10. **30-Day Streak Forecast** — Projected XP and rewards if you maintain your streak`;
        break;

      case "gift_xp":
        systemPrompt = "You are a creative gift card designer and social rewards specialist. Create beautiful, personalized XP gift messages with creative presentation and emotional impact.";
        userPrompt = `Create a beautiful XP gift card:\n\nRecipient: ${params.recipient_name || "Friend"}\nXP Amount: ${params.xp_amount || "50"}\nOccasion: ${params.occasion || "Just because"}\nPersonal Message: ${params.personal_message || "None provided"}\n\nCreate:\n1. **Gift Card Design** — Beautiful formatted gift card with emoji decorations\n2. **Personalized Message** — Expand the sender's message into something heartfelt\n3. **XP Impact Preview** — Show what this XP means (how much closer to next level)\n4. **Gift Bonus** — Suggest a matching challenge for the recipient to earn extra\n5. **Social Share Text** — Ready-to-share message for community feed\n6. **Gift Receipt** — Summary for the sender's records\n7. **Thank You Template** — Suggested thank you message for the recipient`;
        break;

      case "achievement_showcase":
        systemPrompt = "You are a profile design expert and achievement presentation specialist. Create stunning, shareable achievement showcases that highlight users' gaming accomplishments.";
        userPrompt = `Generate an achievement showcase:\n\nTotal Badges: ${params.badge_count || "0"}\nTop Badges: ${params.top_badges || "None specified"}\nLevel: ${params.level || "1"}\nStyle: ${params.showcase_style || "golden-luxury"}\n\nCreate:\n1. **Profile Card Layout** — Text-based showcase card design with borders and formatting\n2. **Achievement Highlights** — Top 5 most impressive achievements with descriptions\n3. **Stats Summary** — Key metrics displayed beautifully\n4. **Rarity Analysis** — How rare your badge collection is vs community\n5. **Title & Rank** — Custom title based on your achievements\n6. **Hall of Fame Entry** — Your entry for the community hall of fame\n7. **Social Share Card** — Formatted text ready to share on social media\n8. **Improvement Goals** — 3 achievements that would make your showcase even better`;
        break;

      case "xp_betting":
        systemPrompt = "You are a competitive gaming analyst and XP betting strategist. Analyze bet proposals, calculate win probabilities, and provide detailed risk/reward analysis for XP wager challenges.";
        userPrompt = `Analyze this XP bet:\n\nBet Amount: ${params.bet_amount || "50"} XP\nChallenge Type: ${params.challenge_type || "engagement-race"}\nRisk Level: ${params.risk_level || "Medium"}\nCurrent XP: ${params.current_xp || "Not specified"}\n\nProvide:\n1. **Bet Analysis** — Detailed breakdown of this wager\n2. **Win Probability** — Estimated chance of winning based on challenge type\n3. **Risk/Reward Matrix** — What you gain vs what you lose\n4. **Challenge Rules** — Specific rules and conditions for this bet\n5. **Strategy Guide** — How to maximize your winning chances\n6. **Historical Odds** — Typical success rates for this challenge type\n7. **Bankroll Management** — Is this bet size appropriate for your XP balance?\n8. **Alternative Bets** — 3 better bets if this one seems too risky\n9. **Payout Structure** — Exact XP earned for different completion levels\n10. **Bet Verdict** — TAKE IT or PASS with reasoning`;
        break;

      case "mystery_badges":
        systemPrompt = "You are a mystery game master and secret badge designer. Create cryptic riddles, hidden badge challenges, and mystery events that reward exploration and creativity.";
        userPrompt = `Decode mystery badges and create events:\n\nCurrent Badges: ${params.current_badges || "None listed"}\nActivity History: ${params.activity_history || "Not specified"}\nDifficulty: ${params.difficulty_preference || "medium"}\n\nProvide:\n1. **Active Mystery Events** — 3 current time-limited secret badge events with cryptic clues\n2. **Riddle Challenges** — 5 riddles that hint at hidden badge unlock conditions\n3. **Pattern Analysis** — Activities you're doing that might trigger secret badges\n4. **Hidden Badge Map** — Guide to 10 secret badges with difficulty ratings\n5. **Easter Egg Hints** — 5 platform easter eggs that award mystery badges\n6. **Time-Limited Alert** — Badges about to expire with urgency and hints\n7. **Community Secrets** — Collaborative challenges requiring group effort\n8. **Riddle Difficulty Rating** — How hard each mystery badge is to solve (1-10)\n9. **First Solver Bonus** — Extra rewards for being first to crack each mystery`;
        break;

      case "reward_marketplace":
        systemPrompt = "You are a rewards economy expert and shopping advisor. Analyze XP spending options, calculate value propositions, and recommend optimal purchasing strategies.";
        userPrompt = `Analyze marketplace spending:\n\nCurrent XP: ${params.current_xp || "Not specified"}\nSpending Priority: ${params.spending_goal || "balanced"}\nInterested Item: ${params.selected_item || "None selected"}\n\nProvide:\n1. **Value Analysis** — Rate each shop item by value-per-XP (best deals)\n2. **Personalized Recommendations** — Top 3 items for your priority\n3. **Budget Plan** — How to allocate XP across categories\n4. **ROI Calculator** — Which items generate the most long-term value\n5. **Timing Strategy** — When to buy vs when to save (seasonal sales)\n6. **Bundle Suggestions** — Combining items for maximum impact\n7. **XP Earning Plan** — How to earn enough XP for your wishlist\n8. **Market Forecast** — Expected new items and price changes\n9. **Spending Tracker** — Recommended weekly spending limits\n10. **VIP Path** — Fastest route to unlock VIP through smart spending`;
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
        max_completion_tokens: action === "xp_optimizer" ? 8000 : 3000 }) });

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

    // Persist result so user can re-view it without paying again
    await supabase.from("rewards_ai_history").insert({ user_id: user.id,
      action,
      input: params,
      result });

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("rewards-ai error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
