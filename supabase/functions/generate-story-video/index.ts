import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme, sceneCount = 4, language = 'english' } = await req.json();
    if (!theme) throw new Error('Theme is required');

    const validSceneCount = Math.max(2, Math.min(6, sceneCount));

    const languageNames: Record<string, string> = {
      english: 'English', slovak: 'Slovak', czech: 'Czech',
      hungarian: 'Hungarian', german: 'German', spanish: 'Spanish',
      french: 'French', italian: 'Italian', polish: 'Polish'
    };
    const targetLanguage = languageNames[language] || 'English';

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    console.log(`Generating story: ${theme}, ${validSceneCount} scenes, ${targetLanguage}`);

    // Step 1: Generate story text with OpenAI
    const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a children's story writer. Write stories in ${targetLanguage}.` },
          { role: 'user', content: `Create a short bedtime story for children about "${theme}" in ${targetLanguage}. Structure it as exactly ${validSceneCount} scenes. Each scene should be 1-2 sentences. Format strictly as:\nScene 1: [text]\nScene 2: [text]\n...\nScene ${validSceneCount}: [text]` }
        ],
        max_tokens: 1000,
      }),
    });

    if (!storyResponse.ok) {
      const errText = await storyResponse.text();
      console.error('Story generation error:', storyResponse.status, errText);
      throw new Error(`Story generation failed: ${storyResponse.status}`);
    }

    const storyData = await storyResponse.json();
    const storyText = storyData.choices[0].message.content;
    console.log('Story generated successfully');

    // Parse scenes
    let scenes: string[] = [];
    const pattern1 = /Scene \d+:\s*(.+)/gi;
    let match;
    while ((match = pattern1.exec(storyText)) !== null) {
      if (match[1].trim()) scenes.push(match[1].trim());
    }
    if (scenes.length < 2) {
      const pattern2 = /\d+[\.\)]\s*(.+)/g;
      scenes = [];
      while ((match = pattern2.exec(storyText)) !== null) {
        if (match[1].trim()) scenes.push(match[1].trim());
      }
    }
    if (scenes.length < validSceneCount) {
      scenes = storyText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 15).slice(0, validSceneCount);
    }
    scenes = scenes.slice(0, validSceneCount);
    console.log(`Parsed ${scenes.length} scenes`);

    // Step 2: Generate images with OpenAI DALL-E 3 (sequential to avoid rate limits)
    const images: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      try {
        console.log(`Generating image ${i + 1}/${scenes.length}...`);
        const imgResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Children's storybook illustration, vibrant colors, friendly cartoon style, cute and whimsical. Scene: ${scenes[i]}`,
            n: 1,
            size: '1024x1024',
            response_format: 'url',
          }),
        });

        if (!imgResponse.ok) {
          const errText = await imgResponse.text();
          console.error(`Image ${i + 1} failed:`, imgResponse.status, errText);
          images.push('');
          continue;
        }

        const imgData = await imgResponse.json();
        const imageUrl = imgData.data?.[0]?.url;
        if (imageUrl) {
          images.push(imageUrl);
          console.log(`Image ${i + 1} generated`);
        } else {
          images.push('');
        }
      } catch (imgErr) {
        console.error(`Image ${i + 1} error:`, imgErr);
        images.push('');
      }
    }

    console.log(`Generated ${images.filter(Boolean).length}/${scenes.length} images`);

    return new Response(
      JSON.stringify({ scenes, images, audioFiles: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in generate-story-video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
