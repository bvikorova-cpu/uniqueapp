import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Heart, Utensils, Zap, Star, Plus, Loader2, TrendingUp, Dumbbell, Sparkles, Moon, Shield } from "lucide-react";
import { calculateDecay } from "@/utils/petDecay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { petImages } from "@/data/petImages";
import { motion } from "framer-motion";

interface MyPetsProps {
  onSelectPet: (petId: string) => void;
}

export const MyPets = ({ onSelectPet }: MyPetsProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  const navigate = useNavigate();

  const { data: petTypes } = useQuery({
    queryKey: ['pet-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_types')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: pets, isLoading } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (!pets || pets.length === 0) return;
    const applyDecay = async () => {
      const petsToUpdate = pets.map(pet => {
        const decay = calculateDecay(pet);
        return { pet, decay };
      }).filter(({ decay }) => decay.needsUpdate);
      if (petsToUpdate.length === 0) return;
      for (const { pet, decay } of petsToUpdate) {
        await supabase.from('pets').update({
          hunger: decay.hunger, happiness: decay.happiness, energy: decay.energy,
          last_activity_at: new Date().toISOString(),
        }).eq('id', pet.id);
      }
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
    };
    applyDecay();
  }, [pets?.length]);

  const handleAdoptPet = () => {
    if (!newPetName.trim()) return toast.error('Please enter a pet name');
    if (!selectedTypeId) return toast.error('Please select a pet type');
    createPetMutation.mutate();
  };

  const createPetMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const selectedType = petTypes?.find(pt => pt.id === selectedTypeId);
      if (!selectedType) throw new Error('Pet type not found');
      const price = selectedType.price || 0;
      if (price > 0) {
        if (credits.credits_remaining < price) throw new Error('INSUFFICIENT_CREDITS');
        const { error: creditError } = await supabase.from('ai_credits').update({
          credits_remaining: credits.credits_remaining - price, last_used_at: new Date().toISOString(),
        }).eq('user_id', user.id);
        if (creditError) throw creditError;
        await supabase.from('ai_usage_history').insert({
          user_id: user.id, usage_type: 'pet_adoption', credits_used: price,
          description: `Adopted ${selectedType.name}`,
        });
      }
      const { data, error } = await supabase.from('pets').insert([{
        user_id: user.id, pet_type_id: selectedTypeId, name: newPetName
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success('Pet adopted successfully! 🎉');
      setIsCreateOpen(false); setNewPetName(""); setSelectedTypeId("");
    },
    onError: (error: any) => {
      if (error.message === 'INSUFFICIENT_CREDITS') {
        toast.error('Not enough credits. Redirecting to purchase...');
        setTimeout(() => navigate('/ai-credits'), 1500);
      } else toast.error(error.message || 'Failed to adopt pet');
    }
  });

  const feedPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const { data, error } = await supabase.from('pets').update({
        hunger: 100,
        happiness: Math.min(((pets?.find(p => p.id === petId)?.happiness || 50) + 10), 100),
        last_fed_at: new Date().toISOString()
      }).eq('id', petId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-pets'] }); toast.success('Pet fed! +10 happiness 🍖'); }
  });

  const playWithPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const pet = pets?.find(p => p.id === petId);
      if (!pet) return;
      const { data, error } = await supabase.from('pets').update({
        happiness: Math.min((pet.happiness + 15), 100),
        energy: Math.max((pet.energy - 10), 0),
        experience: pet.experience + 5,
        total_games_played: pet.total_games_played + 1,
        last_played_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      }).eq('id', petId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-pets'] }); toast.success('Played with pet! +15 happiness, +5 XP 🎮'); }
  });

  const trainPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const pet = pets?.find(p => p.id === petId);
      if (!pet) return;
      const xpGain = 20;
      const newXP = pet.experience + xpGain;
      const xpToNext = getXPToNextLevel(pet.level);
      let newLevel = pet.level;
      let remainingXP = newXP;
      if (newXP >= xpToNext) { newLevel = pet.level + 1; remainingXP = newXP - xpToNext; }
      const { data, error } = await supabase.from('pets').update({
        experience: remainingXP, level: newLevel,
        energy: Math.max((pet.energy - 20), 0), last_activity_at: new Date().toISOString()
      }).eq('id', petId).select().single();
      if (error) throw error;
      return { data, leveledUp: newLevel > pet.level };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success(result?.leveledUp ? 'Training complete! +20 XP and LEVELED UP! 🎉' : 'Training complete! +20 XP 💪');
    }
  });

  const restPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const { data, error } = await supabase.from('pets').update({
        energy: 100, last_activity_at: new Date().toISOString()
      }).eq('id', petId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-pets'] }); toast.success('Pet is well rested! Energy restored 😴'); }
  });

  const evolvePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const pet = pets?.find(p => p.id === petId);
      if (!pet) return;
      const evolutionLevels = Array.isArray(pet.pet_types?.evolution_levels) ? pet.pet_types.evolution_levels as any[] : [];
      const nextStage = (pet.evolution_stage || 0) + 1;
      if (nextStage >= evolutionLevels.length) throw new Error('Pet is already at max evolution!');
      const requiredLevel = evolutionLevels[nextStage]?.level || 999;
      if (pet.level < requiredLevel) throw new Error(`Need level ${requiredLevel} to evolve!`);
      const { data, error } = await supabase.from('pets').update({
        evolution_stage: nextStage, last_activity_at: new Date().toISOString()
      }).eq('id', petId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-pets'] }); toast.success('🌟 Pet evolved to next stage! 🌟'); },
    onError: (error: any) => toast.error(error.message)
  });

  const getEvolutionStage = (pet: any) => {
    const evolutionLevels = Array.isArray(pet.pet_types?.evolution_levels) ? pet.pet_types.evolution_levels as any[] : [];
    let stage = 0;
    for (let i = 0; i < evolutionLevels.length; i++) { if (pet.level >= evolutionLevels[i].level) stage = i; }
    return evolutionLevels[stage] || { name: pet.pet_types?.name };
  };

  const getXPToNextLevel = (level: number) => level * 10;

  const getPetEmoji = (species: string) => {
    const emojiMap: Record<string, string> = {
      'dog': '🐕', 'cat': '🐈', 'rabbit': '🐰', 'hamster': '🐹',
      'dragon': '🐉', 'unicorn': '🦄', 'phoenix': '🔥',
      'red_panda': '🐼', 'fennec_fox': '🦊', 'axolotl': '🦎',
      'quokka': '🦘', 'sugar_glider': '🐿️', 'toucan': '🦜',
      'peacock': '🦚', 'penguin': '🐧', 'owl': '🦉',
      'griffin': '🦅', 'kitsune': '🦊', 'cerberus': '🐺',
      'chameleon': '🦎', 'gecko': '🦎', 'dolphin': '🐬',
      'sea_turtle': '🐢', 'seahorse': '🌊', 'butterfly': '🦋',
      'ladybug': '🐞', 'sloth': '🦥'
    };
    return emojiMap[species] || '🐾';
  };

  const getPetImage = (petTypeName: string, species: string) => {
    const name = petTypeName?.toLowerCase() || '';
    const speciesLower = species?.toLowerCase() || '';
    if (petImages[speciesLower]) return petImages[speciesLower];
    if (name.includes('puppy') || name.includes('dog')) return petImages.puppy;
    if (name.includes('kitten') || name.includes('cat')) return petImages.kitten;
    if (name.includes('bunny') || name.includes('rabbit')) return petImages.bunny;
    if (name.includes('hamster')) return petImages.bunny;
    if (name.includes('dragon')) return petImages.dragon;
    if (name.includes('unicorn')) return petImages.unicorn;
    if (name.includes('phoenix')) return petImages.phoenix;
    if (name.includes('griffin')) return petImages.griffin;
    if (name.includes('kitsune') || name.includes('fox')) return petImages.kitsune;
    if (name.includes('parrot') || name.includes('toucan')) return petImages.parrot;
    if (name.includes('turtle')) return petImages.turtle;
    return null;
  };

  const getHealthColor = (value: number) => {
    if (value >= 70) return 'text-emerald-500';
    if (value >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            My Pets ({pets?.length || 0})
          </h2>
          <p className="text-xs text-muted-foreground">Adopt, feed, train & evolve your companions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 active:scale-[0.97] transition-transform">
              <Plus className="h-4 w-4" /> Adopt Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Adopt a New Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAdoptPet(); }} className="space-y-4">
              <div>
                <Label htmlFor="petName">Pet Name</Label>
                <Input id="petName" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} placeholder="Enter a name..." required />
              </div>
              <div>
                <Label htmlFor="petType">Pet Type</Label>
                <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                  <SelectTrigger><SelectValue placeholder="Choose a pet type..." /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {petTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} {type.is_premium && '⭐'} {type.price > 0 && `(${type.price} credits)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTypeId && petTypes && (
                <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Credits:</span>
                      <span className="font-bold">{credits.credits_remaining}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-bold text-primary">{petTypes.find(pt => pt.id === selectedTypeId)?.price || 0} credits</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Button type="submit" className="w-full" disabled={createPetMutation.isPending}>
                {createPetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adopt Pet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {(!pets || pets.length === 0) && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-bold mb-2">No Pets Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Adopt your first companion and start your journey!</p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Adopt Your First Pet</Button>
          </CardContent>
        </Card>
      )}

      {/* Pet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets?.map((pet, i) => {
          const evolutionStage = getEvolutionStage(pet);
          const xpToNext = getXPToNextLevel(pet.level);
          const xpProgress = (pet.experience % xpToNext) / xpToNext * 100;
          const canEvolve = (() => {
            const evoLevels = Array.isArray(pet.pet_types?.evolution_levels) ? pet.pet_types.evolution_levels as any[] : [];
            const nextStage = (pet.evolution_stage || 0) + 1;
            if (nextStage >= evoLevels.length) return false;
            return pet.level >= (evoLevels[nextStage]?.level || 999);
          })();

          return (
            <motion.div key={pet.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, type: "spring" }}>
              <Card
                className="border-border/40 bg-card/80 backdrop-blur-xl hover:border-primary/30 transition-all cursor-pointer active:scale-[0.97] group overflow-hidden"
                onClick={() => onSelectPet(pet.id)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Pet Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                      {getPetImage(pet.pet_types?.name || '', pet.pet_types?.species || '') ? (
                        <img src={getPetImage(pet.pet_types?.name || '', pet.pet_types?.species || '')!} alt={pet.name}
                          className="w-full h-full object-contain group-hover:animate-[bounce_1s_ease-in-out_infinite]" />
                      ) : (
                        <div className="text-5xl group-hover:animate-[bounce_1s_ease-in-out_infinite]">
                          {getPetEmoji(pet.pet_types?.species || '')}
                        </div>
                      )}
                      {canEvolve && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1 animate-pulse">
                          <Sparkles className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black truncate">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{evolutionStage.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-bold">Level {pet.level}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-xs font-bold">{pet.battle_wins || 0}W</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{pet.battle_losses || 0}L</span>
                    </div>
                  </div>

                  {/* Stats Bars */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Heart className={`h-3 w-3 ${getHealthColor(pet.happiness)}`} />
                      <Progress value={pet.happiness} className="flex-1 h-1.5" />
                      <span className="text-[10px] font-bold w-8 text-right">{pet.happiness}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className={`h-3 w-3 ${getHealthColor(pet.hunger)}`} />
                      <Progress value={pet.hunger} className="flex-1 h-1.5" />
                      <span className="text-[10px] font-bold w-8 text-right">{pet.hunger}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className={`h-3 w-3 ${getHealthColor(pet.energy)}`} />
                      <Progress value={pet.energy} className="flex-1 h-1.5" />
                      <span className="text-[10px] font-bold w-8 text-right">{pet.energy}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <Progress value={xpProgress} className="flex-1 h-1.5" />
                      <span className="text-[10px] font-bold w-8 text-right">{Math.round(xpProgress)}%</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 text-[10px] px-1 active:scale-[0.95]"
                      onClick={(e) => { e.stopPropagation(); feedPetMutation.mutate(pet.id); }}>
                      <Utensils className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[10px] px-1 active:scale-[0.95]"
                      onClick={(e) => { e.stopPropagation(); playWithPetMutation.mutate(pet.id); }}>
                      <Heart className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[10px] px-1 active:scale-[0.95]"
                      onClick={(e) => { e.stopPropagation(); trainPetMutation.mutate(pet.id); }}>
                      <Dumbbell className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[10px] px-1 active:scale-[0.95]"
                      onClick={(e) => { e.stopPropagation(); restPetMutation.mutate(pet.id); }}>
                      <Moon className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Evolve Button */}
                  {canEvolve && (
                    <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-[0.97]"
                      onClick={(e) => { e.stopPropagation(); evolvePetMutation.mutate(pet.id); }}>
                      <Sparkles className="h-3 w-3" /> Evolve Now!
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
