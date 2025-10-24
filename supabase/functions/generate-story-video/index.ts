import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme } = await req.json();
    
    if (!theme) {
      throw new Error('Theme is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating story for theme:', theme);

    // Generate story with 4 scenes
    const storyPrompt = `Create a very short bedtime story for children about ${theme}. 
    Structure it as exactly 4 scenes, each scene should be 1-2 sentences.
    Format: Scene 1: [text]
    Scene 2: [text]
    Scene 3: [text]
    Scene 4: [text]`;

    console.log('Calling AI for story generation...');
    const storyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a children\'s story writer.' },
          { role: 'user', content: storyPrompt }
        ],
      }),
    });

    if (!storyResponse.ok) {
      const errorText = await storyResponse.text();
      console.error('Story generation error:', storyResponse.status, errorText);
      
      if (storyResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (storyResponse.status === 402) {
        throw new Error('Payment required. Please add funds to your Lovable AI workspace.');
      }
      
      throw new Error(`Failed to generate story: ${storyResponse.status}`);
    }

    const storyData = await storyResponse.json();
    const storyText = storyData.choices[0].message.content;
    console.log('Story generated:', storyText);

    // Parse scenes - try multiple patterns
    let scenes: string[] = [];
    
    // Try pattern 1: "Scene 1: text"
    const pattern1 = /Scene \d+:\s*([^\n]+)/gi;
    let match;
    while ((match = pattern1.exec(storyText)) !== null) {
      if (match[1].trim()) scenes.push(match[1].trim());
    }
    
    // If pattern 1 didn't work, try pattern 2: numbered list "1. text"
    if (scenes.length < 4) {
      scenes = [];
      const pattern2 = /\d+\.\s*([^\n]+)/g;
      while ((match = pattern2.exec(storyText)) !== null) {
        if (match[1].trim()) scenes.push(match[1].trim());
      }
    }
    
    // If still not enough, split by newlines and take non-empty lines
    if (scenes.length < 4) {
      scenes = storyText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 10 && !line.toLowerCase().includes('scene'))
        .slice(0, 4);
    }

    if (scenes.length < 4) {
      console.error('Not enough scenes parsed:', scenes);
      console.error('Original text:', storyText);
      throw new Error('Failed to generate 4 scenes');
    }

    console.log('Parsed scenes:', scenes);

    // Generate images for each scene
    const images: string[] = [];
    for (let i = 0; i < 4; i++) {
      const imagePrompt = `Children's storybook illustration, vibrant colors, friendly cartoon style: ${scenes[i]}`;
      
      console.log(`Generating image ${i + 1}...`);
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { role: 'user', content: imagePrompt }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!imageResponse.ok) {
        console.error(`Image ${i} generation error:`, imageResponse.status);
        continue;
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        images.push(imageUrl);
        console.log(`Image ${i + 1} generated successfully`);
      }
    }

    console.log(`Generated ${images.length} images`);

    return new Response(
      JSON.stringify({ 
        scenes: scenes.slice(0, 4),
        images: images
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-story-video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
