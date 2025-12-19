import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Generate story text
    const storyPrompt = `Create a magical children's story with these details:
Title: ${title}
Characters: ${characters}
Theme/Setting: ${theme}

Write an engaging, age-appropriate story (300-500 words) that is fun, educational, and has a positive message. Make it creative and imaginative!

Format your response as JSON:
{
  "story": "The complete story text here"
}`;

    const storyResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative children's story writer. Create engaging, fun, and age-appropriate stories." },
          { role: "user", content: storyPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!storyResponse.ok) {
      const errorText = await storyResponse.text();
      console.error("OpenAI API error:", storyResponse.status, errorText);
      
      if (storyResponse.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      throw new Error("Failed to get AI response");
    }

    const storyData = await storyResponse.json();
    const storyContent = JSON.parse(storyData.choices[0].message.content);

    // Generate illustration with OpenAI
    const illustrationPrompt = `Create a colorful, child-friendly illustration for this story: ${title}. Theme: ${theme}. Characters: ${characters}. Make it magical, vibrant, and fun for kids aged 6-12. Ultra high resolution.`;

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
        }
      }
    } catch (imgError) {
      console.error("Error generating illustration:", imgError);
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
      console.error('Error saving story:', saveError);
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

    return new Response(JSON.stringify({
      title,
      story: storyContent.story,
      illustration: illustrationUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in kids-story-creator:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
