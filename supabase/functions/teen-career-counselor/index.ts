import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Unauthorized");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { interests, strengths, goals } = await req.json();

    let { data: usage, error: usageError } = await supabaseClient
      .from("teen_career_counselor_usage")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (usageError && usageError.code === "PGRST116") {
      const { data: newUsage, error: insertError } = await supabaseClient
        .from("teen_career_counselor_usage")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      usage = newUsage;
    } else if (usageError) {
      throw usageError;
    }

    const hasFreeTrial = usage.free_generations_used < 1;
    const hasPaidGenerations = usage.paid_generations > 0;

    if (!hasFreeTrial && !hasPaidGenerations) {
      return new Response(
        JSON.stringify({ 
          error: "No generations available. Please purchase more to continue.",
          requiresPayment: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Check for Shadow Arena achievements
    const { data: shadowArenaAchievements } = await supabaseClient
      .from("shadow_arena_achievements")
      .select("*")
      .eq("user_id", user.id);

    const hasShadowArenaBadge = (shadowArenaAchievements?.length || 0) > 0;
    
    // Build achievement context for AI
    let achievementContext = "";
    if (hasShadowArenaBadge) {
      const placements = shadowArenaAchievements!.map((a: { placement: number }) => {
        switch (a.placement) {
          case 1: return "1st Place";
          case 2: return "2nd Place";
          case 3: return "3rd Place";
          default: return "Top 3";
        }
      });
      achievementContext = `
IMPORTANT: This user has VERIFIED COMMUNITY ACHIEVEMENTS:
- Shadow Arena Talent Badge: ${placements.join(", ")} winner in Shadow Arena Monthly Horror Storytelling Battles
- This demonstrates STRONG Creative & Performance abilities including:
  * Creative writing and storytelling skills
  * Public speaking and performance under pressure
  * Ability to engage and captivate an audience
  * Competitive drive and ability to excel against peers
  * Digital content creation skills
  
Incorporate these verified achievements as significant strengths in your career recommendations.
Suggest careers that leverage these creative and performance abilities.`;
    }

    const systemPrompt = `You are an expert career counselor specializing in helping teenagers (13-18 years old) explore career paths. 
Your role is to provide personalized, encouraging, and realistic career guidance based on their interests, strengths, and goals.
${achievementContext}

Provide:
1. 3-5 specific career paths that match their profile
2. Brief explanation of why each career fits their interests and strengths
3. Educational pathways for each career
4. Key skills they should develop
5. Realistic outlook and growth opportunities
6. Actionable next steps they can take now
${hasShadowArenaBadge ? `
7. A special section titled "VERIFIED COMMUNITY ACHIEVEMENTS" that:
   - Lists their Shadow Arena Talent Badge(s)
   - Explains how this achievement demonstrates valuable career-relevant skills
   - Shows how winning in competitive creative battles is recognized by employers` : ''}

Be encouraging, age-appropriate, and realistic. Format your response in a clear, easy-to-read structure with headings and bullet points.`;

    const userPrompt = `Here is a teenager looking for career guidance:

Interests and Hobbies: ${interests}
Strengths: ${strengths}
${goals ? `Career Goals: ${goals}` : ''}

Please provide comprehensive career guidance tailored to their profile.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const guidance = aiData.choices[0].message.content;

    if (hasFreeTrial) {
      await supabaseClient
        .from("teen_career_counselor_usage")
        .update({ free_generations_used: usage.free_generations_used + 1 })
        .eq("user_id", user.id);
    } else {
      await supabaseClient
        .from("teen_career_counselor_usage")
        .update({ paid_generations: usage.paid_generations - 1 })
        .eq("user_id", user.id);
    }

    // Mark achievements as notified
    if (hasShadowArenaBadge) {
      await supabaseClient
        .from("shadow_arena_achievements")
        .update({ notified_teen_career: true })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({ 
        guidance,
        hasShadowArenaBadge,
        shadowArenaAchievements: shadowArenaAchievements || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in teen-career-counselor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
