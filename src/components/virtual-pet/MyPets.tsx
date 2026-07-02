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
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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

      // Free pets can be inserted directly (RLS allows owner inserts).
      if (price <= 0) {
        const { data, error } = await supabase.from('pets').insert([{
          user_id: user.id, pet_type_id: selectedTypeId, name: newPetName,
        }]).select().single();
        if (error) throw error;
        return data;
      }

      // Paid adoption: server-side credit deduction + insert (atomic).
      if (credits.credits_remaining < price) throw new Error('INSUFFICIENT_CREDITS');
      const { data, error } = await supabase.functions.invoke('pet-purchase-item', {
        body: { itemType: 'pet_type', itemId: selectedTypeId, petName: newPetName },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.code === 'INSUFFICIENT_CREDITS') throw new Error('INSUFFICIENT_CREDITS');
        throw new Error(data.error);
      }
      return data?.reward?.pet;
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
      <>
        <FloatingHowItWorks title="How My Pets works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      </>
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

          const overallHealth = Math.round((pet.happiness + pet.hunger + pet.energy) / 3);
          const healthGradient = overallHealth >= 70 ? 'from-emerald-500 to-teal-400' : overallHealth >= 40 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';

          return (
            <motion.div key={pet.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 120 }}>
              <Card
                className="relative border-border/30 bg-card/90 backdrop-blur-xl hover:border-primary/40 transition-all duration-300 cursor-pointer active:scale-[0.97] group overflow-hidden hover:shadow-lg hover:shadow-primary/10"
                onClick={() => onSelectPet(pet.id)}
              >
                {/* Top accent gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${healthGradient}`} />
                {/* Subtle glow */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${healthGradient} opacity-[0.07] blur-2xl group-hover:opacity-[0.12] transition-opacity`} />

                <CardContent className="p-4 space-y-3 relative">
                  {/* Pet Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors">
                        {getPetImage(pet.pet_types?.name || '', pet.pet_types?.species || '') ? (
                          <img src={getPetImage(pet.pet_types?.name || '', pet.pet_types?.species || '')!} alt={pet.name}
                            className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                            {getPetEmoji(pet.pet_types?.species || '')}
                          </div>
                        )}
                      </div>
                      {canEvolve && (
                        <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-1 animate-pulse shadow-lg shadow-amber-500/30">
                          <Sparkles className="h-3 w-3" />
                        </div>
                      )}
                      {/* Level badge */}
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                        Lv.{pet.level}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black truncate">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{evolutionStage.name}</p>
                      {/* Win/Loss compact */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-emerald-500">{pet.battle_wins || 0}W</span>
                        <span className="text-[10px] text-muted-foreground">/</span>
                        <span className="text-[10px] font-bold text-red-400">{pet.battle_losses || 0}L</span>
                      </div>
                    </div>
                    {/* Overall health ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
                        <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={`${overallHealth * 0.942} 100`}
                          className={overallHealth >= 70 ? 'stroke-emerald-500' : overallHealth >= 40 ? 'stroke-amber-500' : 'stroke-red-500'} />
                      </svg>
                      <span className="absolute text-[10px] font-black">{overallHealth}%</span>
                    </div>
                  </div>

                  {/* Stats Bars - styled */}
                  <div className="space-y-2 bg-muted/30 rounded-xl p-2.5">
                    {[
                      { icon: Heart, label: "Happy", value: pet.happiness, color: "bg-pink-500" },
                      { icon: Utensils, label: "Hunger", value: pet.hunger, color: "bg-orange-500" },
                      { icon: Zap, label: "Energy", value: pet.energy, color: "bg-cyan-500" },
                      { icon: TrendingUp, label: "XP", value: xpProgress, color: "bg-primary" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-2">
                        <stat.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                        <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                            className={`h-full rounded-full ${stat.color}`}
                          />
                        </div>
                        <span className="text-[10px] font-bold w-8 text-right text-muted-foreground">{Math.round(stat.value)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons - styled */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { icon: Utensils, action: () => feedPetMutation.mutate(pet.id), tip: "Feed", gradient: "hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-500" },
                      { icon: Heart, action: () => playWithPetMutation.mutate(pet.id), tip: "Play", gradient: "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-500" },
                      { icon: Dumbbell, action: () => trainPetMutation.mutate(pet.id), tip: "Train", gradient: "hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-500" },
                      { icon: Moon, action: () => restPetMutation.mutate(pet.id), tip: "Rest", gradient: "hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-500" },
                    ].map((btn) => (
                      <Button key={btn.tip} size="sm" variant="outline"
                        className={`h-9 px-1 active:scale-[0.93] transition-all duration-200 ${btn.gradient}`}
                        onClick={(e) => { e.stopPropagation(); btn.action(); }}>
                        <btn.icon className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>

                  {/* Evolve Button */}
                  {canEvolve && (
                    <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white active:scale-[0.97] shadow-lg shadow-amber-500/20 font-bold"
                      onClick={(e) => { e.stopPropagation(); evolvePetMutation.mutate(pet.id); }}>
                      <Sparkles className="h-3.5 w-3.5" /> Evolve Now!
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
