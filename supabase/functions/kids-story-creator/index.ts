import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Category-specific system prompts for tone and style
const CATEGORY_PROMPTS: Record<string, string> = {
  adventure: "You are an exciting adventure storyteller. Create thrilling stories with brave heroes, exciting journeys, and triumphant victories. Include action, exploration, and the joy of discovery.",
  fantasy: "You are a magical fantasy storyteller. Create enchanting stories with wizards, magical creatures, spells, and mystical lands. Fill the story with wonder and imagination.",
  educational: "You are an educational storyteller. Create stories that teach valuable lessons about science, nature, history, or life skills in an engaging and fun way. Include interesting facts wrapped in narrative.",
  mystery: "You are a mystery storyteller for children. Create intriguing stories with puzzles to solve, clues to find, and mysteries to unravel. Keep it age-appropriate and exciting without being scary.",
  friendship: "You are a heartwarming storyteller about friendship. Create stories that celebrate the bonds between friends, teamwork, kindness, and the value of true friendship.",
  animal: "You are an animal adventure storyteller. Create stories featuring animals as main characters with their unique personalities, adventures, and lessons about nature and wildlife.",
  space: "You are a space exploration storyteller. Create stories about astronauts, aliens, planets, and cosmic adventures. Inspire wonder about the universe and space exploration.",
  "fairy-tale": "You are a classic fairy tale storyteller. Create stories with princes, princesses, magical transformations, and happy endings. Include classic fairy tale elements with a modern positive twist."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { title, characters, theme, category = "adventure" } = await req.json();
    
    if (!title || !characters || !theme) {
      throw new Error("Missing required fields");
    }

    console.log("[KIDS-STORY-CREATOR] Creating story for user:", user.id, "Category:", category);

    // Check subscription status
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let isPremium = false;

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      isPremium = subscriptions.data.length > 0;
    }

    console.log("[KIDS-STORY-CREATOR] User premium status:", isPremium);

    // Check monthly limit for free users
    if (!isPremium) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usageData, error: usageError } = await supabaseClient
        .from('kids_story_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('Error fetching usage:', usageError);
      }

      const lastResetMonth = usageData?.last_reset_date?.slice(0, 7);
      const storiesCreated = lastResetMonth === currentMonth ? usageData.stories_created_this_month : 0;

      if (storiesCreated >= 1) {
        throw new Error("Monthly limit reached! Upgrade to Premium for unlimited stories.");
      }
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Get category-specific system prompt
    const categoryPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.adventure;

    // Generate story text with category-specific tone
    const storyPrompt = `Create a magical children's story with these details:
Title: ${title}
Characters: ${characters}
Theme/Setting: ${theme}

Write an engaging, age-appropriate story (300-500 words) that:
- Is fun, educational, and has a positive message
- Uses vivid descriptions and dialogue
- Has a clear beginning, middle, and satisfying end
- Is suitable for children aged 6-12

Format your response as JSON:
{
  "story": "The complete story text here"
}`;

    console.log("[KIDS-STORY-CREATOR] Generating story with GPT-4o-mini...");

    const storyResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: categoryPrompt },
          { role: "user", content: storyPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!storyResponse.ok) {
      const errorText = await storyResponse.text();
      console.error("[KIDS-STORY-CREATOR] OpenAI API error:", storyResponse.status, errorText);
      
      if (storyResponse.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      throw new Error("Failed to get AI response");
    }

    const storyData = await storyResponse.json();
    const storyContent = JSON.parse(storyData.choices[0].message.content);

    console.log("[KIDS-STORY-CREATOR] Story generated, creating illustration...");

    // Generate illustration with OpenAI
    const illustrationPrompt = `Create a colorful, child-friendly digital illustration for a children's story book.

Story title: "${title}"
Theme/Setting: ${theme}
Characters: ${characters}
Genre: ${category}

Style requirements:
- Vibrant, bright colors suitable for children
- Cartoon/illustrated style (not photorealistic)
- Magical, whimsical atmosphere
- Safe and age-appropriate for children 6-12
- High quality, detailed artwork
- No text or words in the image

Ultra high resolution children's book illustration.`;

    let illustrationUrl = null;
    try {
      const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: illustrationPrompt,
          n: 1,
          size: "1024x1024",
          quality: "high",
          output_format: "webp",
          output_compression: 90,
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const base64Image = imageData.data?.[0]?.b64_json;
        if (base64Image) {
          illustrationUrl = `data:image/webp;base64,${base64Image}`;
          console.log("[KIDS-STORY-CREATOR] Illustration generated successfully");
        }
      } else {
        console.error("[KIDS-STORY-CREATOR] Image generation failed:", await imageResponse.text());
      }
    } catch (imgError) {
      console.error("[KIDS-STORY-CREATOR] Error generating illustration:", imgError);
    }

    // Save story to library
    const { error: saveError } = await supabaseClient
      .from('kids_stories')
      .insert({
        user_id: user.id,
        title,
        characters,
        theme,
        category,
        story_text: storyContent.story,
        illustration_url: illustrationUrl
      });

    if (saveError) {
      console.error('[KIDS-STORY-CREATOR] Error saving story:', saveError);
    } else {
      console.log("[KIDS-STORY-CREATOR] Story saved to library");
    }

    // Update usage tracking
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentDate = new Date().toISOString().split('T')[0];
    
    const { data: existingUsage } = await supabaseClient
      .from('kids_story_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingUsage) {
      const lastResetMonth = existingUsage.last_reset_date?.slice(0, 7);
      const newCount = lastResetMonth === currentMonth ? existingUsage.stories_created_this_month + 1 : 1;
      
      await supabaseClient
        .from('kids_story_usage')
        .update({
          stories_created_this_month: newCount,
          last_reset_date: currentDate
        })
        .eq('user_id', user.id);
    } else {
      await supabaseClient
        .from('kids_story_usage')
        .insert({
          user_id: user.id,
          stories_created_this_month: 1,
          last_reset_date: currentDate
        });
    }

    console.log("[KIDS-STORY-CREATOR] Usage updated, returning response");

    return new Response(JSON.stringify({
      title,
      story: storyContent.story,
      illustration: illustrationUrl,
      category,
      characters,
      theme
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[KIDS-STORY-CREATOR] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
