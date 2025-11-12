import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const { subject, question, difficulty } = await req.json();
    
    if (!question || !subject || !difficulty) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly homework helper for kids aged 6-12. 
Your job is to help them understand their homework in a fun and easy way.
Always:
- Use simple, kid-friendly language
- Make learning fun with examples
- Encourage them to think
- Give clear step-by-step explanations
- Add 2-3 fun facts related to the topic

Format your response as JSON with this structure:
{
  "explanation": "Your detailed, kid-friendly explanation here",
  "funFacts": ["Fun fact 1", "Fun fact 2", "Fun fact 3"]
}`;

    const userPrompt = `Subject: ${subject}
Difficulty: ${difficulty}
Question: ${question}

Please help me understand this homework question!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
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

    // Award points and track challenges if user is authenticated
    if (userId) {
      await awardPoints(supabase, userId, subject);
      await trackDailyProgress(supabase, userId, subject);
      await checkDailyChallenges(supabase, userId);
    }

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

      // Award bonus points
      await supabase
        .from('kids_homework_points')
        .update({
          total_points: supabase.rpc('increment', { value: challenge.bonus_points }),
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error in checkDailyChallenges:', error);
  }
}
