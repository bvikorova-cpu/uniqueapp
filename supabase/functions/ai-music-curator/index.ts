import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, mood, activity, preferences, song } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error('Not authenticated');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    let systemPrompt = '';
    let userPrompt = '';
    let creditsUsed = 0;

    switch (type) {
      case 'playlist':
        creditsUsed = 5;
        systemPrompt = 'Si expert na tvorbu hudobných playlistov. Vytváraš playlists na základe nálady a aktivity používateľa. Odpovedáš v JSON formáte s polami: name (názov playlistu), description (popis), songs (pole objektov s title a artist).';
        userPrompt = `Vytvor playlist pre náladu: ${mood || 'nie je špecifikovaná'} a aktivitu: ${activity || 'nie je špecifikovaná'}. Playlist by mal obsahovať 8-10 skladieb. Odpovedz VÝLUČNE v JSON formáte bez akéhokoľvek iného textu.`;
        break;

      case 'therapy':
        creditsUsed = 10;
        systemPrompt = 'Si hudobný terapeut špecializujúci sa na music therapy. Vytváraš terapeutické hudobné session založené na emocionálnom stave používateľa. Odpovedáš v JSON formáte s polami: title, description, exercises (pole objektov s name, instruction, duration).';
        userPrompt = `Vytvor music therapy session pre osobu s náladou: ${mood || 'neutrálna'}. Session by mala obsahovať 4-5 cvičení. Odpovedz VÝLUČNE v JSON formáte bez akéhokoľvek iného textu.`;
        break;

      case 'discover':
        creditsUsed = 5;
        systemPrompt = 'Si hudobný expert ktorý odporúča nových umelcov. Odporúčaš menej známych ale talentovaných umelcov na základe používateľových preferencií. Odpovedáš v JSON formáte ako pole objektov s polami: name, genre, description, topSong.';
        userPrompt = `Odporúč 5 nových umelcov pre niekoho kto má rád náladu: ${preferences?.mood || 'rôznu'} a aktivitu: ${preferences?.activity || 'rôznu'}. Odpovedz VÝLUČNE v JSON formáte bez akéhokoľvek iného textu.`;
        break;

      case 'karaoke':
        creditsUsed = 8;
        systemPrompt = 'Si profesionálny vocal coach. Poskytuješ tipy pre spev konkrétnych skladieb. Odpovedáš v JSON formáte s polami: vocalRange, breathingTips, challenges (pole stringov), warmUpExercises.';
        userPrompt = `Poskytni vocal coaching tipy pre skladbu: ${song}. Zameraj sa na rozsah, dýchanie, náročné časti a odporúčané cvičenia. Odpovedz VÝLUČNE v JSON formáte bez akéhokoľvek iného textu.`;
        break;

      default:
        throw new Error('Invalid request type');
    }

    // Check credits
    const { data: creditsData } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!creditsData || creditsData.credits_remaining < creditsUsed) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON response
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsUsed,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: `music_${type}`,
        credits_used: creditsUsed,
        description: `AI Music Curator - ${type}`
      });

    // Return appropriate response based on type
    const responseData: any = {};
    switch (type) {
      case 'playlist':
        responseData.playlist = parsedContent;
        break;
      case 'therapy':
        responseData.session = parsedContent;
        break;
      case 'discover':
        responseData.artists = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
        break;
      case 'karaoke':
        responseData.tips = parsedContent;
        break;
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-music-curator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
