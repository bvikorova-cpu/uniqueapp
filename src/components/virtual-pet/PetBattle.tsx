import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Swords, Loader2, Trophy, Zap, Star, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import puppyImg from "@/assets/pets/cute-puppy.png";
import kittenImg from "@/assets/pets/cute-kitten.png";
import bunnyImg from "@/assets/pets/cute-bunny.png";
import hamsterImg from "@/assets/pets/cute-hamster.png";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PetBattle = () => {
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: pets, isLoading } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: battleHistory } = useQuery({
    queryKey: ['pet-battles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pet_battles').select('*').order('created_at', { ascending: false }).limit(10);
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
      if (result.isWinner) toast.success(`🏆 Victory! +${result.xpEarned} XP earned!`);
      else toast.info(`😢 Defeat! +${result.xpEarned} XP earned for trying.`);
    },
    onError: (error: any) => toast.error(error.message || 'Battle failed')
  });

  const togglePetSelection = (petId: string) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) return prev.filter(id => id !== petId);
      if (prev.length >= 4) { toast.error('Maximum 4 pets per battle'); return prev; }
      return [...prev, petId];
    });
  };

  const startBattle = () => {
    if (selectedPets.length === 0) return toast.error('Select at least one pet for battle');
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
      'dragon': '🐉', 'unicorn': '🦄', 'phoenix': '🔥', 'griffin': '🦅', 'kitsune': '🦊'
    };
    return emojiMap[species?.toLowerCase()] || '🐾';
  };

  const calculatePower = (pet: any) => (pet.level || 1) * 10 + Math.floor((pet.happiness || 50) / 2) + Math.floor((pet.energy || 50) / 2);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <FloatingHowItWorks title="How Pet Battle works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Battle Info Banner */}
      <Card className="border-red-500/20 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <Swords className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-black text-base">Pet Battle Arena</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select up to 4 pets to battle against AI opponents! Power = Level×10 + Stats
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" /><span>Win = +25-40 XP</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" /><span>Lose = +10-20 XP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Selection */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Swords className="h-5 w-5 text-red-500" /> Select Your Team
            </h2>
            <Badge variant="outline" className="text-xs font-bold">{selectedPets.length}/4</Badge>
          </div>

          {!pets || pets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No pets available. Adopt some pets first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {pets.map((pet, i) => {
                const isSelected = selectedPets.includes(pet.id);
                const power = calculatePower(pet);
                const petImg = getPetImage(pet.pet_types?.name);
                return (
                  <motion.div key={pet.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                    <Card
                      className={`p-2.5 cursor-pointer transition-all active:scale-[0.95] ${isSelected
                        ? "border-2 border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border/40 hover:border-primary/30"
                      }`}
                      onClick={() => togglePetSelection(pet.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="relative w-12 h-12 mb-1.5 flex items-center justify-center">
                          {petImg ? (
                            <img src={petImg} alt={pet.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-3xl">{getPetEmoji(pet.pet_types?.species || '')}</span>
                          )}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                              <CheckCircle className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-xs truncate w-full">{pet.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-2.5 w-2.5 text-amber-500" />
                          <span className="text-[10px]">Lvl {pet.level}</span>
                        </div>
                        <Badge variant="secondary" className="mt-1 text-[9px] px-1.5 py-0">
                          <Zap className="h-2.5 w-2.5 mr-0.5" />{power}
                        </Badge>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{pet.battle_wins || 0}W/{pet.battle_losses || 0}L</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {selectedPets.length > 0 && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Team Power:</span>
                <Badge className="text-sm gap-1">
                  <Zap className="h-3 w-3" />
                  {pets?.filter(p => selectedPets.includes(p.id)).reduce((sum, p) => sum + calculatePower(p), 0)}
                </Badge>
              </div>
            </div>
          )}

          <Button onClick={startBattle} disabled={battleMutation.isPending || selectedPets.length === 0}
            className="w-full gap-2 active:scale-[0.97]" size="lg">
            {battleMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Battle in Progress...</>
            ) : (
              <><Swords className="h-4 w-4" />Start Battle ({selectedPets.length} Pet{selectedPets.length !== 1 ? 's' : ''})</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Battle Result */}
      {battleResult && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`overflow-hidden ${battleResult.isWinner
            ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10'
            : 'border-border/40 bg-card/80'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className={`h-6 w-6 ${battleResult.isWinner ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <h3 className="text-xl font-black">{battleResult.isWinner ? '🏆 Victory!' : '😢 Defeat!'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="border-border/20 bg-background/50"><CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Your Team</p>
                  <p className="text-2xl font-black text-primary">{battleResult.myTeamPower}</p>
                </CardContent></Card>
                <Card className="border-border/20 bg-background/50"><CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Opponent</p>
                  <p className="text-2xl font-black text-destructive">{battleResult.opponentPower}</p>
                </CardContent></Card>
              </div>
              <div className="text-center mb-4">
                <Badge variant="outline" className="text-base px-4 py-1 gap-1">
                  <Star className="h-4 w-4 text-amber-500" />+{battleResult.xpEarned} XP
                </Badge>
              </div>
              {battleResult.battleLog?.map((log: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-background/30 rounded-lg p-2 text-xs mb-1">
                  <span className="font-bold">{log.myPet.name} <Badge variant="outline" className="text-[9px] ml-1">{log.myPet.power}</Badge></span>
                  <span className="text-muted-foreground text-[10px]">vs</span>
                  <span className="font-bold">{log.opponent.name} <Badge variant="outline" className="text-[9px] ml-1">{log.opponent.power}</Badge></span>
                  <Badge variant={log.winner === 'challenger' ? 'default' : 'destructive'} className="text-[9px]">
                    {log.winner === 'challenger' ? 'Won' : 'Lost'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Battle History */}
      {battleHistory && battleHistory.length > 0 && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <h3 className="font-black mb-3 flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-amber-500" /> Recent Battles
            </h3>
            <div className="space-y-1.5">
              {battleHistory.slice(0, 5).map((battle: any) => (
                <div key={battle.id} className="flex justify-between items-center text-xs bg-background/30 rounded-lg p-2">
                  <Badge variant={battle.winner_id === battle.challenger_id ? 'default' : 'destructive'} className="text-[9px]">
                    {battle.winner_id === battle.challenger_id ? 'Victory' : 'Defeat'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{battle.challenger_power} vs {battle.opponent_power}</span>
                  <span className="text-[10px] font-bold text-primary">+{battle.xp_earned} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
    </>
    );
};
