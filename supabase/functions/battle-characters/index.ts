import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error('Not authenticated');

    const { character1Id, character2Id, battleType = 'quick' } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Fetch both characters
    const { data: characters, error: fetchError } = await supabaseClient
      .from('characters')
      .select('*')
      .in('id', [character1Id, character2Id]);

    if (fetchError || !characters || characters.length !== 2) {
      throw new Error('Failed to fetch characters');
    }

    const char1 = characters.find(c => c.id === character1Id);
    const char2 = characters.find(c => c.id === character2Id);

    // Calculate winner based on stats
    const char1Power = char1.attack + char1.defense + char1.speed + (char1.hp / 2);
    const char2Power = char2.attack + char2.defense + char2.speed + (char2.hp / 2);
    
    // Add some randomness (20% variance)
    const char1Final = char1Power * (0.9 + Math.random() * 0.2);
    const char2Final = char2Power * (0.9 + Math.random() * 0.2);
    
    const winnerId = char1Final > char2Final ? char1.id : char2.id;
    const winner = char1Final > char2Final ? char1 : char2;
    const loser = char1Final > char2Final ? char2 : char1;

    // Generate battle commentary using AI
    const commentaryPrompt = `Create an exciting battle commentary for a fight between two characters:
    
Winner: ${winner.name} (${winner.category}) - ${winner.description}
Stats: HP ${winner.hp}, ATK ${winner.attack}, DEF ${winner.defense}, SPD ${winner.speed}
Special Power: ${winner.special_power}

Loser: ${loser.name} (${loser.category}) - ${loser.description}  
Stats: HP ${loser.hp}, ATK ${loser.attack}, DEF ${loser.defense}, SPD ${loser.speed}
Special Power: ${loser.special_power}

Write an engaging 3-4 paragraph battle description that shows how ${winner.name} emerged victorious. Include their special powers and fighting styles. Make it exciting and detailed!`;

    const commentaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: commentaryPrompt }
        ],
      }),
    });

    if (!commentaryResponse.ok) {
      throw new Error('Failed to generate battle commentary');
    }

    const commentaryData = await commentaryResponse.json();
    const battleCommentary = commentaryData.choices[0].message.content;

    // Create battle record
    const expiresAt = battleType === 'popularity' 
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: battle, error: battleError } = await supabaseClient
      .from('character_battles')
      .insert({
        battle_type: battleType,
        character1_id: char1.id,
        character2_id: char2.id,
        winner_id: winnerId,
        battle_commentary: battleCommentary,
        status: battleType === 'popularity' ? 'active' : 'completed',
        expires_at: expiresAt
      })
      .select()
      .single();

    if (battleError) throw battleError;

    // Update character stats
    const xpGain = battleType === 'quick' ? 10 : 25;

    await supabaseClient
      .from('characters')
      .update({
        wins: winner.wins + 1,
        experience: winner.experience + xpGain,
        level: Math.floor((winner.experience + xpGain) / 100) + 1
      })
      .eq('id', winnerId);

    await supabaseClient
      .from('characters')
      .update({
        losses: loser.losses + 1,
        experience: loser.experience + (xpGain / 2)
      })
      .eq('id', loser.id);

    return new Response(
      JSON.stringify({
        battle,
        winner,
        loser,
        commentary: battleCommentary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in battle-characters function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
