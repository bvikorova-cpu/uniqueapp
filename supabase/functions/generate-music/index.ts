import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, title, description, genre, mood, tempo, originalSong, remixStyle, instructions } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error('Not authenticated');

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const creditsRequired = type === 'generate' ? 15 : 20;

    // Check credits
    const { data: creditsData } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!creditsData || creditsData.credits_remaining < creditsRequired) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let lyrics = '';
    let coverArtUrl = '';

    if (type === 'generate') {
      // Generate lyrics using AI
      const lyricsPrompt = `Create song lyrics for a ${genre} song titled "${title}". 
Theme: ${description}
Mood: ${mood}
Tempo: ${tempo} BPM

Create full song lyrics with verses, chorus, and bridge. Format with clear sections.`;

      const lyricsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional songwriter. Create compelling, well-structured song lyrics.' },
            { role: 'user', content: lyricsPrompt }
          ],
        }),
      });

      if (lyricsResponse.ok) {
        const lyricsData = await lyricsResponse.json();
        lyrics = lyricsData.choices[0].message.content;
      }

      // Generate cover art using DALL-E 3
      const artPrompt = `Create album cover art for a ${genre} song titled "${title}". Style: ${mood}, professional music album cover, vibrant colors, artistic`;

      const artResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: artPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        }),
      });

      if (artResponse.ok) {
        const artData = await artResponse.json();
        const base64Image = artData.data?.[0]?.b64_json;
        if (base64Image) {
          coverArtUrl = `data:image/png;base64,${base64Image}`;
        }
      }
    } else if (type === 'remix') {
      // Generate remix instructions
      const remixPrompt = `Create a ${remixStyle} remix concept for: ${originalSong}
Additional instructions: ${instructions || 'None'}

Provide detailed remix notes including arrangement changes, instrumentation, and style transformation.`;

      const remixResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional music producer specializing in remixes.' },
            { role: 'user', content: remixPrompt }
          ],
        }),
      });

      if (remixResponse.ok) {
        const remixData = await remixResponse.json();
        lyrics = remixData.choices[0].message.content;
      }
    }

    // Create song record
    const songData = {
      user_id: user.id,
      title: type === 'generate' ? title : `${originalSong} (${remixStyle} Remix)`,
      lyrics,
      genre: type === 'generate' ? genre : remixStyle,
      mood: type === 'generate' ? mood : null,
      tempo: type === 'generate' ? tempo : null,
      cover_art_url: coverArtUrl || null,
      is_remix: type === 'remix',
      original_song_reference: type === 'remix' ? originalSong : null,
      credits_used: creditsRequired,
      status: 'completed',
      metadata: type === 'remix' ? { instructions } : {}
    };

    const { data: song, error: songError } = await supabaseClient
      .from('ai_generated_songs')
      .insert(songData)
      .select()
      .single();

    if (songError) throw songError;

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsRequired,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: `music_${type}`,
        credits_used: creditsRequired,
        description: `AI Music ${type === 'generate' ? 'Generation' : 'Remix'} - ${songData.title}`
      });

    return new Response(
      JSON.stringify({ song }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-music:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
