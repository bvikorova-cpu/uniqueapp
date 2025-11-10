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
    const { theme, sceneCount = 4, language = 'english' } = await req.json();
    
    if (!theme) {
      throw new Error('Theme is required');
    }

    // Validate scene count
    const validSceneCount = Math.max(2, Math.min(20, sceneCount));
    
    // Language mapping
    const languageNames: Record<string, string> = {
      english: 'English',
      slovak: 'Slovak',
      czech: 'Czech',
      hungarian: 'Hungarian',
      german: 'German',
      spanish: 'Spanish',
      french: 'French',
      italian: 'Italian',
      polish: 'Polish'
    };
    
    const targetLanguage = languageNames[language] || 'English';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Generating story for theme: ${theme} with ${validSceneCount} scenes in ${targetLanguage}`);

    // Generate story with variable number of scenes - with consistent main characters
    const storyPrompt = `Create a ${validSceneCount <= 6 ? 'short' : 'detailed'} bedtime story for children about ${theme} IN ${targetLanguage} LANGUAGE. 
    The story MUST feature these two main characters throughout ALL scenes: a small white rabbit and a yellow duck.
    These two characters should appear together in every scene.
    Structure it as exactly ${validSceneCount} scenes, each scene should be ${validSceneCount <= 6 ? '1-2' : '2-3'} sentences.
    Write the ENTIRE story in ${targetLanguage}.
    Format: Scene 1: [text with rabbit and duck in ${targetLanguage}]
    Scene 2: [text with rabbit and duck in ${targetLanguage}]
    ...
    Scene ${validSceneCount}: [text with rabbit and duck in ${targetLanguage}]`;

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
            { role: 'system', content: `You are a children's story writer. Write stories in the requested language.` },
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
    if (scenes.length < validSceneCount) {
      scenes = storyText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 10 && !line.toLowerCase().includes('scene'))
        .slice(0, validSceneCount);
    }

    if (scenes.length < validSceneCount) {
      console.error(`Not enough scenes parsed: ${scenes.length}/${validSceneCount}`, scenes);
      console.error('Original text:', storyText);
      throw new Error(`Failed to generate ${validSceneCount} scenes`);
    }

    console.log('Parsed scenes:', scenes);

    // First, generate a detailed character description to ensure consistency
    console.log('Generating character descriptions...');
    const characterPrompt = `Based on this story theme: "${theme}", create a very detailed visual description of the main characters (maximum 2 characters). 
    Include specific details like: hair color, eye color, clothing colors and style, distinctive features.
    Keep it under 100 words and make it suitable for children's storybook illustration.
    Format: Character 1: [detailed description]. Character 2: [detailed description].`;
    
    const characterResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a children\'s book illustrator who creates detailed character descriptions.' },
          { role: 'user', content: characterPrompt }
        ],
      }),
    });

    if (!characterResponse.ok) {
      console.error('Character description error:', characterResponse.status);
      throw new Error('Failed to generate character descriptions');
    }

    const characterData = await characterResponse.json();
    const characterDescription = characterData.choices[0].message.content;
    console.log('Character descriptions:', characterDescription);

    // Generate images for each scene - using consistent character descriptions
    const images: string[] = [];
    const baseStyle = "Children's storybook illustration, vibrant colors, friendly cartoon style, consistent character design";
    
    for (let i = 0; i < validSceneCount; i++) {
      const imagePrompt = `${baseStyle}. Characters: ${characterDescription}. Scene: ${scenes[i]}`;
      
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
        scenes: scenes.slice(0, validSceneCount),
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
