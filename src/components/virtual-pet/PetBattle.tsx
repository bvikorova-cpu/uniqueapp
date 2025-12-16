import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Swords, Loader2, Trophy, Zap, Star, Shield, CheckCircle } from "lucide-react";
import puppyImg from "@/assets/pets/cute-puppy.png";
import kittenImg from "@/assets/pets/cute-kitten.png";
import bunnyImg from "@/assets/pets/cute-bunny.png";
import hamsterImg from "@/assets/pets/cute-hamster.png";

export const PetBattle = () => {
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: pets, isLoading } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: battleHistory } = useQuery({
    queryKey: ['pet-battles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const battleMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('battle-pets', {
        body: { myPetIds: selectedPets, battleType: 'ai' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      setBattleResult(result);
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet-battles'] });
      if (result.isWinner) {
        toast.success(`🏆 Victory! +${result.xpEarned} XP earned!`);
      } else {
        toast.info(`😢 Defeat! +${result.xpEarned} XP earned for trying.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Battle failed');
    }
  });

  const togglePetSelection = (petId: string) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      }
      if (prev.length >= 4) {
        toast.error('Maximum 4 pets per battle');
        return prev;
      }
      return [...prev, petId];
    });
  };

  const startBattle = () => {
    if (selectedPets.length === 0) {
      toast.error('Select at least one pet for battle');
      return;
    }
    setBattleResult(null);
    battleMutation.mutate();
  };

  const getPetImage = (petTypeName: string) => {
    const name = petTypeName?.toLowerCase() || '';
    if (name.includes('puppy') || name.includes('dog')) return puppyImg;
    if (name.includes('kitten') || name.includes('cat')) return kittenImg;
    if (name.includes('bunny') || name.includes('rabbit')) return bunnyImg;
    if (name.includes('hamster')) return hamsterImg;
    return null;
  };

  const getPetEmoji = (species: string) => {
    const emojiMap: Record<string, string> = {
      'dog': '🐕', 'cat': '🐈', 'rabbit': '🐰', 'hamster': '🐹',
      'dragon': '🐉', 'unicorn': '🦄', 'phoenix': '🔥',
      'griffin': '🦅', 'kitsune': '🦊'
    };
    return emojiMap[species?.toLowerCase()] || '🐾';
  };

  const calculatePower = (pet: any) => {
    return (pet.level || 1) * 10 + Math.floor((pet.happiness || 50) / 2) + Math.floor((pet.energy || 50) / 2);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Battle Description */}
      <Card className="p-4 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-red-500/20">
        <div className="flex items-start gap-3 mb-3">
          <Swords className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-base mb-2">Pet Battle Arena</h3>
            <p className="text-sm text-muted-foreground">
              Select up to 4 pets to battle against AI opponents! Each pet's power is calculated from their level, happiness, and energy. The team with higher total power wins!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Win = +25-40 XP per pet</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Lose = +10-20 XP per pet</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-500" />
            <span>Power = Level×10 + Stats</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-purple-500" />
            <span>Max 4 pets per battle</span>
          </div>
        </div>
      </Card>

      {/* Pet Selection */}
      <Card className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-red-500" />
            <h2 className="text-lg sm:text-xl font-bold">Select Your Team</h2>
          </div>
          <Badge variant="outline" className="text-xs">
            {selectedPets.length}/4 Selected
          </Badge>
        </div>

        {!pets || pets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No pets available. Adopt some pets first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {pets.map((pet) => {
              const isSelected = selectedPets.includes(pet.id);
              const power = calculatePower(pet);
              const petImg = getPetImage(pet.pet_types?.name);

              return (
                <Card
                  key={pet.id}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? "border-2 border-primary bg-primary/10 shadow-lg" 
                      : "hover:bg-accent hover:shadow-md"
                  }`}
                  onClick={() => togglePetSelection(pet.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-16 h-16 mb-2">
                      {petImg ? (
                        <img src={petImg} alt={pet.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-4xl">{getPetEmoji(pet.pet_types?.species || '')}</span>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-sm truncate w-full">{pet.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{pet.pet_types?.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">Lvl {pet.level}</span>
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {power} Power
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pet.battle_wins || 0}W / {pet.battle_losses || 0}L
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {selectedPets.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Team Total Power:</span>
              <Badge className="text-sm">
                <Zap className="h-3 w-3 mr-1" />
                {pets?.filter(p => selectedPets.includes(p.id)).reduce((sum, p) => sum + calculatePower(p), 0)} Power
              </Badge>
            </div>
          </div>
        )}

        <Button
          onClick={startBattle}
          disabled={battleMutation.isPending || selectedPets.length === 0}
          className="w-full"
          size="lg"
        >
          {battleMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Battle in Progress...
            </>
          ) : (
            <>
              <Swords className="mr-2 h-4 w-4" />
              Start Battle ({selectedPets.length} Pet{selectedPets.length !== 1 ? 's' : ''})
            </>
          )}
        </Button>
      </Card>

      {/* Battle Result */}
      {battleResult && (
        <Card className={`p-4 sm:p-6 ${battleResult.isWinner 
          ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400/50'
          : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-400/50'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className={`h-6 w-6 ${battleResult.isWinner ? 'text-yellow-500' : 'text-gray-500'}`} />
            <h3 className="text-xl sm:text-2xl font-bold">
              {battleResult.isWinner ? '🏆 Victory!' : '😢 Defeat!'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Team</p>
              <p className="text-2xl font-bold text-primary">{battleResult.myTeamPower}</p>
              <p className="text-xs text-muted-foreground">Power</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Opponent</p>
              <p className="text-2xl font-bold text-destructive">{battleResult.opponentPower}</p>
              <p className="text-xs text-muted-foreground">Power</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <Badge variant="outline" className="text-lg px-4 py-1">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              +{battleResult.xpEarned} XP Earned!
            </Badge>
          </div>

          {/* Battle Log */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Battle Log:</h4>
            {battleResult.battleLog?.map((log: any, index: number) => (
              <div key={index} className="flex items-center justify-between bg-background/30 rounded p-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.myPet.name}</span>
                  <Badge variant="outline" className="text-xs">{log.myPet.power}</Badge>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.opponent.name}</span>
                  <Badge variant="outline" className="text-xs">{log.opponent.power}</Badge>
                </div>
                <Badge variant={log.winner === 'challenger' ? 'default' : 'destructive'} className="text-xs">
                  {log.winner === 'challenger' ? 'Won' : 'Lost'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Battle History */}
      {battleHistory && battleHistory.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Recent Battles
          </h3>
          <div className="space-y-2">
            {battleHistory.slice(0, 5).map((battle: any) => (
              <div key={battle.id} className="flex justify-between items-center text-sm bg-muted/50 rounded p-2">
                <div className="flex items-center gap-2">
                  <Badge variant={battle.winner_id === battle.challenger_id ? 'default' : 'destructive'} className="text-xs">
                    {battle.winner_id === battle.challenger_id ? 'Victory' : 'Defeat'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {battle.challenger_power} vs {battle.opponent_power}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  +{battle.xp_earned} XP
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};