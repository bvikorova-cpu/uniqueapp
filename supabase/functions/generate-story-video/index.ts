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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log(`Generating story: ${theme}, ${validSceneCount} scenes, ${targetLanguage}`);

    // Step 1: Generate story text
    const storyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: `You are a children's story writer. Write stories in ${targetLanguage}.` },
          { role: 'user', content: `Create a short bedtime story for children about "${theme}" in ${targetLanguage}. Structure it as exactly ${validSceneCount} scenes. Each scene should be 1-2 sentences. Format strictly as:\nScene 1: [text]\nScene 2: [text]\n...\nScene ${validSceneCount}: [text]` }
        ],
      }),
    });

    if (!storyResponse.ok) {
      const errText = await storyResponse.text();
      console.error('Story generation error:', storyResponse.status, errText);
      if (storyResponse.status === 429) throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      if (storyResponse.status === 402) throw new Error('AI credits exhausted. Please add credits.');
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

    // Step 2: Generate images using Lovable AI image model
    const images: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      try {
        console.log(`Generating image ${i + 1}/${scenes.length}...`);
        const imgResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [
              { role: 'user', content: `Children's storybook illustration, vibrant colors, friendly cartoon style. Scene: ${scenes[i]}` }
            ],
            modalities: ['image', 'text'],
          }),
        });

        if (!imgResponse.ok) {
          console.error(`Image ${i + 1} failed:`, imgResponse.status);
          if (imgResponse.status === 429) {
            console.log('Rate limited on image gen, waiting 5s...');
            await new Promise(r => setTimeout(r, 5000));
          }
          images.push('');
          continue;
        }

        const imgData = await imgResponse.json();
        const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) {
          images.push(imageUrl);
          console.log(`Image ${i + 1} generated`);
        } else {
          console.error(`Image ${i + 1}: no image in response`);
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
