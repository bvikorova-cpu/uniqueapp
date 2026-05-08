import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDIT_COSTS: Record<string, number> = {
  song_lyrics: 8,
  screenplay: 15,
  theater_play: 12,
  novel_chapter: 10,
  poetry: 5,
  standup: 8,
  podcast_script: 10,
  ad_copy: 6,
  revision: 3,
};

const CATEGORY_PROMPTS: Record<string, string> = {
  song_lyrics: `You are a professional songwriter with decades of experience writing hit songs. Create complete, professional song lyrics based on the user's input. Include:
- Verse 1, Chorus, Verse 2, Chorus, Bridge, Final Chorus structure
- Rhyme scheme and rhythm that flows naturally
- Emotional depth and storytelling
- Hook lines that are memorable`,
  
  screenplay: `You are a Hollywood screenwriter with experience in major productions. Create a professional screenplay scene or section based on the user's input. Include:
- Proper screenplay format (INT/EXT, scene headings, action lines, dialogue)
- Character descriptions and motivations
- Visual storytelling elements
- Dramatic tension and pacing`,
  
  theater_play: `You are an acclaimed playwright. Create a theatrical scene or act based on the user's input. Include:
- Stage directions and blocking suggestions
- Character dialogue with distinct voices
- Dramatic structure and conflict
- Emotional beats and timing`,
  
  novel_chapter: `You are a bestselling novelist. Create a compelling chapter or story section based on the user's input. Include:
- Rich prose and vivid descriptions
- Character development and inner thoughts
- Scene setting and atmosphere
- Plot progression and hooks`,
  
  poetry: `You are a poet laureate with mastery of various forms. Create beautiful poetry based on the user's input. Include:
- Appropriate poetic form (sonnet, free verse, haiku, etc.)
- Imagery and metaphor
- Rhythm and sound devices
- Emotional resonance`,
  
  standup: `You are a professional stand-up comedian who has headlined major comedy clubs. Create a stand-up comedy routine based on the user's input. Include:
- Setup and punchline structures
- Callbacks and running jokes
- Observational humor and relatable content
- Natural comedic timing cues`,
  
  podcast_script: `You are a successful podcast producer. Create a professional podcast script based on the user's input. Include:
- Engaging intro and outro
- Segment breakdowns
- Talking points and transitions
- Call-to-action elements`,
  
  ad_copy: `You are an award-winning advertising copywriter. Create compelling ad copy based on the user's input. Include:
- Attention-grabbing headline
- Persuasive body copy
- Clear call-to-action
- Brand voice consistency`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // NOTE: CreativeForge uses its own dedicated `creative_forge_credits` ledger
    // (purchased via the dedicated checkout). Do NOT also debit the unified
    // ai_credits ledger here — that caused double-charging users.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { category, title, inputData, styleReference, isRevision, originalContent } = await req.json();

    const creditCost = isRevision ? CREDIT_COSTS.revision : (CREDIT_COSTS[category] || 10);

    // Check credits
    const { data: credits, error: creditsError } = await supabase
      .from("creative_forge_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) throw creditsError;

    const currentCredits = credits?.credits_remaining || 0;
    if (currentCredits < creditCost) {
      throw new Error(`Insufficient credits. You need ${creditCost} credits but have ${currentCredits}.`);
    }

    // Build prompt
    let systemPrompt = CATEGORY_PROMPTS[category] || "You are a professional creative writer.";
    let userPrompt = "";

    if (isRevision && originalContent) {
      userPrompt = `Please revise and improve the following content based on these instructions: ${inputData.revisionNotes}\n\nOriginal content:\n${originalContent}`;
    } else {
      userPrompt = `Create content with the following details:\n`;
      userPrompt += `Title/Theme: ${title}\n`;
      
      if (inputData.genre) userPrompt += `Genre/Style: ${inputData.genre}\n`;
      if (inputData.mood) userPrompt += `Mood/Tone: ${inputData.mood}\n`;
      if (inputData.description) userPrompt += `Description: ${inputData.description}\n`;
      if (inputData.characters) userPrompt += `Characters: ${inputData.characters}\n`;
      if (inputData.setting) userPrompt += `Setting: ${inputData.setting}\n`;
      if (inputData.targetAudience) userPrompt += `Target Audience: ${inputData.targetAudience}\n`;
      if (inputData.length) userPrompt += `Desired Length: ${inputData.length}\n`;
      if (styleReference) userPrompt += `Style Reference: Write in a style similar to ${styleReference}\n`;
    }

    console.log(`Generating ${category} content for user ${user.id}, cost: ${creditCost} credits`);

    // Call OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      }
      throw new Error("Failed to generate content");
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from("creative_forge_credits")
      .update({ 
        credits_remaining: currentCredits - creditCost,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Save project
    const { data: project, error: projectError } = await supabase
      .from("creative_forge_projects")
      .insert({
        user_id: user.id,
        category,
        title,
        input_data: inputData,
        generated_content: generatedContent,
        style_reference: styleReference,
        credits_used: creditCost,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    console.log(`Successfully generated content, project ID: ${project.id}`);

    // Log AI usage history for analytics (without re-debiting credits)
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "creative_content",
      credits_used: creditCost,
      description: `${category}${isRevision ? " (revision)" : ""}: ${title}`,
    }).then(() => {}, (e) => console.error("usage log failed:", e));

    return new Response(JSON.stringify({ 
      content: generatedContent,
      project,
      creditsUsed: creditCost,
      creditsRemaining: currentCredits - creditCost
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-creative-content:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
