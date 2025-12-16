import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { myPetIds, battleType = 'ai' } = await req.json();

    if (!myPetIds || myPetIds.length === 0) {
      throw new Error('Please select at least one pet for battle');
    }

    console.log(`User ${user.id} starting ${battleType} battle with pets:`, myPetIds);

    // Fetch user's selected pets
    const { data: myPets, error: myPetsError } = await supabase
      .from('pets')
      .select('*, pet_types(*)')
      .in('id', myPetIds)
      .eq('user_id', user.id);

    if (myPetsError || !myPets || myPets.length === 0) {
      throw new Error('Could not find your selected pets');
    }

    // Calculate power for each pet: (level * 10) + happiness + energy + random bonus
    const calculatePetPower = (pet: any) => {
      const basePower = (pet.level || 1) * 10;
      const happinessBonus = Math.floor((pet.happiness || 50) / 2);
      const energyBonus = Math.floor((pet.energy || 50) / 2);
      const randomBonus = Math.floor(Math.random() * 20);
      const experienceBonus = Math.floor((pet.experience || 0) / 10);
      return basePower + happinessBonus + energyBonus + randomBonus + experienceBonus;
    };

    const myTeamPower = myPets.reduce((sum, pet) => sum + calculatePetPower(pet), 0);

    let opponentPets: any[] = [];
    let opponentPower = 0;
    let opponentId: string | null = null;

    if (battleType === 'ai') {
      // Generate AI opponent pets based on user's team strength
      const avgLevel = Math.ceil(myPets.reduce((sum, p) => sum + (p.level || 1), 0) / myPets.length);
      
      // Create simulated opponent pets
      const opponentCount = Math.min(myPets.length, 4);
      for (let i = 0; i < opponentCount; i++) {
        const aiLevel = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1);
        const aiPet = {
          id: `ai-${i}`,
          name: ['Shadow', 'Thunder', 'Blaze', 'Storm', 'Frost', 'Phoenix'][Math.floor(Math.random() * 6)],
          level: aiLevel,
          happiness: 60 + Math.floor(Math.random() * 40),
          energy: 60 + Math.floor(Math.random() * 40),
          experience: aiLevel * 10,
          pet_types: { name: ['Dragon', 'Phoenix', 'Unicorn', 'Griffin'][Math.floor(Math.random() * 4)] }
        };
        opponentPets.push(aiPet);
        opponentPower += calculatePetPower(aiPet);
      }
    } else {
      // PvP battle - find random opponent
      const { data: randomPets, error: randomError } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .neq('user_id', user.id)
        .limit(myPets.length);

      if (randomError || !randomPets || randomPets.length === 0) {
        // No opponents available, use AI instead
        const avgLevel = Math.ceil(myPets.reduce((sum, p) => sum + (p.level || 1), 0) / myPets.length);
        for (let i = 0; i < myPets.length; i++) {
          const aiLevel = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1);
          const aiPet = {
            id: `ai-${i}`,
            name: ['Shadow', 'Thunder', 'Blaze'][Math.floor(Math.random() * 3)],
            level: aiLevel,
            happiness: 60 + Math.floor(Math.random() * 40),
            energy: 60 + Math.floor(Math.random() * 40),
            experience: aiLevel * 10,
            pet_types: { name: ['Dragon', 'Phoenix'][Math.floor(Math.random() * 2)] }
          };
          opponentPets.push(aiPet);
          opponentPower += calculatePetPower(aiPet);
        }
      } else {
        opponentPets = randomPets;
        opponentId = randomPets[0]?.user_id || null;
        opponentPower = randomPets.reduce((sum, pet) => sum + calculatePetPower(pet), 0);
      }
    }

    // Determine winner
    const isWinner = myTeamPower > opponentPower;
    const winnerId = isWinner ? user.id : opponentId;

    // Calculate XP earned
    const xpEarned = isWinner ? 25 + Math.floor(Math.random() * 15) : 10 + Math.floor(Math.random() * 10);

    // Generate battle log
    const battleLog = myPets.map((pet, index) => {
      const opponent = opponentPets[index % opponentPets.length];
      const myPetPower = calculatePetPower(pet);
      const opponentPetPower = calculatePetPower(opponent);
      const petWon = myPetPower > opponentPetPower;
      
      return {
        myPet: { name: pet.name, power: myPetPower, species: pet.pet_types?.name },
        opponent: { name: opponent.name, power: opponentPetPower, species: opponent.pet_types?.name },
        winner: petWon ? 'challenger' : 'opponent'
      };
    });

    // Record battle
    const { error: battleError } = await supabase
      .from('pet_battles')
      .insert({
        challenger_id: user.id,
        opponent_id: opponentId,
        challenger_pets: myPetIds,
        opponent_pets: opponentPets.filter(p => !p.id.startsWith('ai-')).map(p => p.id),
        challenger_power: myTeamPower,
        opponent_power: opponentPower,
        winner_id: winnerId,
        battle_type: battleType,
        xp_earned: xpEarned,
        battle_log: battleLog
      });

    if (battleError) {
      console.error('Error recording battle:', battleError);
    }

    // Update pet stats
    for (const pet of myPets) {
      await supabase
        .from('pets')
        .update({
          experience: (pet.experience || 0) + xpEarned,
          battle_wins: isWinner ? (pet.battle_wins || 0) + 1 : pet.battle_wins || 0,
          battle_losses: !isWinner ? (pet.battle_losses || 0) + 1 : pet.battle_losses || 0,
          energy: Math.max(0, (pet.energy || 50) - 10),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', pet.id);
    }

    console.log(`Battle complete! Winner: ${isWinner ? 'Challenger' : 'Opponent'}, Power: ${myTeamPower} vs ${opponentPower}`);

    return new Response(
      JSON.stringify({
        success: true,
        isWinner,
        myTeamPower,
        opponentPower,
        xpEarned,
        battleLog,
        myPets: myPets.map(p => ({ id: p.id, name: p.name, species: p.pet_types?.name, level: p.level })),
        opponentPets: opponentPets.map(p => ({ id: p.id, name: p.name, species: p.pet_types?.name, level: p.level }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Battle error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Battle failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});