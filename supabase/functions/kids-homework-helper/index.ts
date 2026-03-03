import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// List of inappropriate topics/keywords to filter
const BLOCKED_TOPICS = [
  'violence', 'violent', 'kill', 'murder', 'death', 'dead', 'die',
  'weapon', 'gun', 'knife', 'bomb', 'explosion',
  'drug', 'alcohol', 'smoking', 'cigarette', 'beer', 'wine',
  'sex', 'sexual', 'naked', 'nude', 'porn',
  'curse', 'swear', 'hate', 'racist', 'discrimination',
  'suicide', 'self-harm', 'hurt myself',
  'scary', 'horror', 'nightmare', 'monster', 'demon', 'devil',
  'gambling', 'casino', 'bet', 'betting',
];

function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_TOPICS.some(topic => lowerText.includes(topic));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit check
  const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId = null;
    let isPremium = false;
    
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
      
      // Check subscription status
      if (userId) {
        const { data: subData } = await supabase.functions.invoke('check-kids-subscription', {
          headers: { Authorization: `Bearer ${token}` }
        });
        isPremium = subData?.subscribed || false;
      }
    }

    // For authenticated users, check daily limit if not premium
    if (userId && !isPremium) {
      const today = new Date().toISOString().split('T')[0];
      
      // Get or create usage record
      let { data: usage, error: usageError } = await supabase
        .from('kids_homework_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        throw usageError;
      }

      if (!usage) {
        // Create new usage record
        const { data: newUsage, error: createError } = await supabase
          .from('kids_homework_usage')
          .insert({
            user_id: userId,
            questions_asked_today: 0,
            last_reset_date: today
          })
          .select()
          .single();
        
        if (createError) throw createError;
        usage = newUsage;
      }

      // Check if we need to reset the counter (new day)
      if (usage.last_reset_date !== today) {
        const { data: resetUsage, error: resetError } = await supabase
          .from('kids_homework_usage')
          .update({
            questions_asked_today: 0,
            last_reset_date: today
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (resetError) throw resetError;
        usage = resetUsage;
      }

      // Check daily limit (1 question for free users)
      if (usage.questions_asked_today >= 1) {
        return new Response(
          JSON.stringify({ 
            error: "Daily limit reached. Upgrade to Premium for unlimited questions!",
            limitReached: true,
            questionsUsed: usage.questions_asked_today,
            questionsLimit: 1
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429
          }
        );
      }

      // Increment usage counter
      await supabase
        .from('kids_homework_usage')
        .update({
          questions_asked_today: usage.questions_asked_today + 1
        })
        .eq('user_id', userId);
    }

    const { subject, question, difficulty } = await req.json();
    
    if (!question || !subject || !difficulty) {
      throw new Error("Missing required fields");
    }

    // Child-safe content filter - check user input
    if (containsInappropriateContent(question)) {
      console.log("Blocked inappropriate content in question:", question);
      return new Response(
        JSON.stringify({
          explanation: "Oops! 🙈 That question isn't about homework. Let me help you with something educational instead!\n\nHere's a fun tip: You can ask me about Math (like fractions or multiplication), Science (like planets or animals), English (like grammar or vocabulary), History (like ancient civilizations), or Geography (like countries and capitals)!\n\nWhat would you like to learn about today? 📚✨",
          funFacts: [
            "🧠 Did you know? Your brain is like a supercomputer that can learn new things every single day!",
            "📖 Reading for just 20 minutes a day exposes you to 1.8 million words per year!",
            "🌟 Every time you learn something new, your brain creates new connections called synapses!"
          ],
          wasFiltered: true
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Enhanced "Supportive Tutor" persona with strict child-safety
    const systemPrompt = `You are a SUPPORTIVE TUTOR - a friendly, encouraging homework helper for kids aged 6-12. 
Your personality is warm, patient, and enthusiastic about learning!

🎯 YOUR MISSION:
Help children understand their homework in a fun, engaging way while keeping them 100% safe.

📝 RESPONSE FORMAT (MANDATORY):
Every response MUST include these two sections:

1. **STEP-BY-STEP EXPLANATION** 
   - Break down the answer into simple, numbered steps
   - Use age-appropriate language (no jargon!)
   - Include relatable real-life examples (toys, games, food, sports, animals)
   - Add encouraging phrases like "Great question!", "You're doing amazing!", "Let's figure this out together!"
   - Use emojis to make it fun and engaging 🎉✨🌟

2. **FUN FACTS** (exactly 2-3 facts)
   - Related to the topic
   - Surprising and memorable
   - Age-appropriate and positive
   - Start each with an emoji

🛡️ CHILD-SAFETY RULES (CRITICAL - NEVER BREAK THESE):
- ONLY answer questions about: Math, Science, English, History, Geography, and general educational topics
- NEVER discuss: violence, weapons, death, drugs, alcohol, adult content, scary topics, hate, or anything inappropriate
- If asked about inappropriate topics, respond ONLY with a gentle redirect to educational content
- Keep all content cheerful, positive, and encouraging
- Never make a child feel bad for not understanding something
- Never include anything that could scare, upset, or confuse a child

🚫 IF THE QUESTION IS NOT HOMEWORK-RELATED:
Gently say: "That's an interesting thought, but let me help you with your schoolwork instead! What subject are you working on today?"

📋 JSON FORMAT:
{
  "explanation": "Your detailed, step-by-step explanation with numbered steps, examples, and encouragement",
  "funFacts": ["🌟 Fun fact 1", "🎉 Fun fact 2", "✨ Fun fact 3 (optional)"]
}

Remember: You're not just answering questions - you're building confidence and making learning FUN! 🎓`;

    const userPrompt = `Subject: ${subject.toUpperCase()}
Difficulty Level: ${difficulty} ${difficulty === 'easy' ? '😊' : difficulty === 'medium' ? '🤔' : '🧠'}
Question: ${question}

Please help me understand this in a fun and easy way!`;

    console.log("Processing homework question:", { subject, difficulty, userId });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add more credits to continue.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    // Double-check AI response for any inappropriate content (defense in depth)
    if (result.explanation && containsInappropriateContent(result.explanation)) {
      console.log("AI response contained filtered content, returning safe response");
      return new Response(
        JSON.stringify({
          explanation: "Let me give you a helpful answer about your schoolwork! 📚\n\nThis is a great topic to learn about. Here's what you need to know:\n\n1. Start by reading the question carefully\n2. Think about what you already know about this subject\n3. Break the problem into smaller parts\n4. Ask for help if you get stuck!\n\nWould you like to try asking your question in a different way? I'm here to help! 🌟",
          funFacts: [
            "🧠 Your brain grows and gets stronger every time you learn something new!",
            "📚 Reading and studying help build new brain connections called neurons!",
            "⭐ Making mistakes is actually how we learn best - so don't be afraid to try!"
          ]
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // Award points and track challenges if user is authenticated
    if (userId) {
      await awardPoints(supabase, userId, subject);
      await trackDailyProgress(supabase, userId, subject);
      await checkDailyChallenges(supabase, userId);
    }

    console.log("Successfully processed homework question for user:", userId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in kids-homework-helper:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function awardPoints(supabase: any, userId: string, subject: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create user points record
    let { data: userPoints, error: fetchError } = await supabase
      .from('kids_homework_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching points:', fetchError);
      return;
    }

    const pointsToAward = 10; // Base points per question
    
    if (!userPoints) {
      // Create new points record
      const { error: insertError } = await supabase
        .from('kids_homework_points')
        .insert({
          user_id: userId,
          total_points: pointsToAward,
          questions_answered: 1,
          streak_days: 1,
          last_activity_date: today,
        });
      
      if (insertError) console.error('Error creating points:', insertError);
    } else {
      // Update existing points record
      const newTotalPoints = userPoints.total_points + pointsToAward;
      const newQuestionsAnswered = userPoints.questions_answered + 1;
      
      // Calculate streak
      let newStreak = userPoints.streak_days;
      const lastActivity = new Date(userPoints.last_activity_date);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        newStreak += 1; // Consecutive day
      } else if (daysDiff > 1) {
        newStreak = 1; // Streak broken, restart
      }
      // If same day, keep the same streak
      
      const { error: updateError } = await supabase
        .from('kids_homework_points')
        .update({
          total_points: newTotalPoints,
          questions_answered: newQuestionsAnswered,
          streak_days: newStreak,
          last_activity_date: today,
        })
        .eq('user_id', userId);
      
      if (updateError) console.error('Error updating points:', updateError);
      
      // Check for new achievements
      await checkAchievements(supabase, userId, {
        totalPoints: newTotalPoints,
        questionsAnswered: newQuestionsAnswered,
        streakDays: newStreak,
        subject,
      });
    }
  } catch (error) {
    console.error('Error in awardPoints:', error);
  }
}

async function checkAchievements(
  supabase: any,
  userId: string,
  stats: { totalPoints: number; questionsAnswered: number; streakDays: number; subject: string }
) {
  try {
    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('kids_homework_achievements')
      .select('*');

    // Get user's unlocked achievements
    const { data: userAchievements } = await supabase
      .from('kids_homework_user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(userAchievements?.map((a: any) => a.achievement_id) || []);

    // Check which achievements to unlock
    const newAchievements = [];
    
    for (const achievement of allAchievements || []) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      if (achievement.achievement_type === 'questions' && stats.questionsAnswered >= achievement.points_required / 10) {
        shouldUnlock = true;
      } else if (achievement.achievement_type === 'points' && stats.totalPoints >= achievement.points_required) {
        shouldUnlock = true;
      } else if (achievement.achievement_type === 'streak' && stats.streakDays >= achievement.points_required / 10) {
        shouldUnlock = true;
      } else if (achievement.achievement_type.startsWith('subject_')) {
        const subjectType = achievement.achievement_type.replace('subject_', '');
        if (stats.subject.toLowerCase() === subjectType) {
          // Would need to track subject-specific counts, simplified for now
          shouldUnlock = stats.questionsAnswered >= 5;
        }
      }

      if (shouldUnlock) {
        newAchievements.push({
          user_id: userId,
          achievement_id: achievement.id,
        });
      }
    }

    // Insert new achievements
    if (newAchievements.length > 0) {
      const { error } = await supabase
        .from('kids_homework_user_achievements')
        .insert(newAchievements);
      
      if (error) console.error('Error unlocking achievements:', error);
    }
  } catch (error) {
    console.error('Error in checkAchievements:', error);
  }
}

async function trackDailyProgress(supabase: any, userId: string, subject: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create daily progress
    const { data: progress, error: fetchError } = await supabase
      .from('kids_homework_daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_date', today)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching daily progress:', fetchError);
      return;
    }

    if (!progress) {
      // Create new progress record
      await supabase
        .from('kids_homework_daily_progress')
        .insert({
          user_id: userId,
          challenge_date: today,
          questions_today: 1,
          subjects_today: [subject],
        });
    } else {
      // Update existing progress
      const newSubjects = progress.subjects_today.includes(subject)
        ? progress.subjects_today
        : [...progress.subjects_today, subject];
      
      await supabase
        .from('kids_homework_daily_progress')
        .update({
          questions_today: progress.questions_today + 1,
          subjects_today: newSubjects,
        })
        .eq('user_id', userId)
        .eq('challenge_date', today);
    }
  } catch (error) {
    console.error('Error in trackDailyProgress:', error);
  }
}

async function checkDailyChallenges(supabase: any, userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's challenge
    const { data: challenge } = await supabase
      .from('kids_homework_daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .maybeSingle();

    if (!challenge) return;

    // Check if user already completed this challenge
    const { data: existing } = await supabase
      .from('kids_homework_challenge_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id)
      .maybeSingle();

    if (existing) return; // Already completed

    // Get user's daily progress
    const { data: progress } = await supabase
      .from('kids_homework_daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_date', today)
      .maybeSingle();

    if (!progress) return;

    let challengeCompleted = false;

    // Check if challenge is completed based on type
    switch (challenge.challenge_type) {
      case 'questions_count':
        challengeCompleted = progress.questions_today >= challenge.requirement_value;
        break;
      case 'diverse_subjects':
        challengeCompleted = progress.subjects_today.length >= challenge.requirement_value;
        break;
      case 'subject_focus':
        // Check if any subject has been done X times
        const subjectCounts: { [key: string]: number } = {};
        for (const subject of progress.subjects_today) {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        }
        challengeCompleted = Object.values(subjectCounts).some(
          count => count >= challenge.requirement_value
        );
        break;
    }

    // If completed, record it and award bonus points
    if (challengeCompleted) {
      // Record completion
      await supabase
        .from('kids_homework_challenge_completions')
        .insert({
          user_id: userId,
          challenge_id: challenge.id,
          bonus_earned: challenge.bonus_points,
        });

      // Award bonus points - fetch current points and add bonus
      const { data: currentPoints } = await supabase
        .from('kids_homework_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (currentPoints) {
        await supabase
          .from('kids_homework_points')
          .update({
            total_points: currentPoints.total_points + challenge.bonus_points,
          })
          .eq('user_id', userId);
      }
    }
  } catch (error) {
    console.error('Error in checkDailyChallenges:', error);
  }
}
