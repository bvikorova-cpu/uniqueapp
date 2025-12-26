import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
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

    console.log('Calling OpenAI for story generation...');
    const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
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
      
      throw new Error(`Failed to generate story: ${storyResponse.status} - ${errorText}`);
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
    
    const characterResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    // Generate images for each scene using DALL-E 3
    const images: string[] = [];
    const baseStyle = "Children's storybook illustration, vibrant colors, friendly cartoon style, consistent character design";
    
    for (let i = 0; i < validSceneCount; i++) {
      const imagePrompt = `${baseStyle}. Characters: ${characterDescription}. Scene: ${scenes[i]}`;
      
      console.log(`Generating image ${i + 1}...`);
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        }),
      });

      if (!imageResponse.ok) {
        console.error(`Image ${i} generation error:`, imageResponse.status);
        continue;
      }

      const imageData = await imageResponse.json();
      const base64Image = imageData.data?.[0]?.b64_json;
      
      if (base64Image) {
        images.push(`data:image/png;base64,${base64Image}`);
        console.log(`Image ${i + 1} generated successfully`);
      }
    }

    console.log(`Generated ${images.length} images`);

    // Generate audio for each scene
    console.log('Generating audio for scenes...');
    const audioFiles: string[] = [];
    
    // Map language to language codes for the translate-and-generate-audio function
    const languageCodeMap: Record<string, string> = {
      'english': 'en-US',
      'slovak': 'sk-SK',
      'french': 'fr-FR',
      'spanish': 'es-ES',
      'czech': 'en-US', // fallback to English
      'hungarian': 'en-US', // fallback to English
      'german': 'en-US', // fallback to English
      'italian': 'en-US', // fallback to English
      'polish': 'en-US', // fallback to English
    };

    const languageCode = languageCodeMap[language] || 'en-US';

    for (let i = 0; i < validSceneCount; i++) {
      try {
        console.log(`Generating audio for scene ${i + 1}/${validSceneCount}`);
        
        const audioResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/translate-and-generate-audio`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: scenes[i],
              language: languageCode
            })
          }
        );

        if (!audioResponse.ok) {
          console.error(`Audio generation failed for scene ${i + 1}`);
          audioFiles.push('');
          continue;
        }

        const audioData = await audioResponse.json();
        audioFiles.push(audioData.audioContent || '');
        console.log(`Audio generated for scene ${i + 1}`);
      } catch (error) {
        console.error(`Error generating audio for scene ${i + 1}:`, error);
        audioFiles.push('');
      }
    }

    console.log('Audio generation completed');

    return new Response(
      JSON.stringify({ 
        scenes: scenes.slice(0, validSceneCount),
        images: images,
        audioFiles
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
