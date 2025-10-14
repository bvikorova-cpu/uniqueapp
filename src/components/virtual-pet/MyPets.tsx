import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Heart, Utensils, Zap, Star, Plus, Loader2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MyPetsProps {
  onSelectPet: (petId: string) => void;
}

export const MyPets = ({ onSelectPet }: MyPetsProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const queryClient = useQueryClient();

  const { data: petTypes } = useQuery({
    queryKey: ['pet-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_types')
        .select('*')
        .order('is_premium');
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

  const createPetMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pets')
        .insert([{
          user_id: user.id,
          pet_type_id: selectedTypeId,
          name: newPetName
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success('Pet adopted successfully!');
      setIsCreateOpen(false);
      setNewPetName("");
      setSelectedTypeId("");
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to adopt pet');
    }
  });

  const feedPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const { data, error } = await supabase
        .from('pets')
        .update({
          hunger: 100,
          happiness: Math.min(((pets?.find(p => p.id === petId)?.happiness || 50) + 10), 100),
          last_fed_at: new Date().toISOString()
        })
        .eq('id', petId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success('Pet fed! +10 happiness');
    }
  });

  const playWithPetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const pet = pets?.find(p => p.id === petId);
      if (!pet) return;

      const { data, error } = await supabase
        .from('pets')
        .update({
          happiness: Math.min((pet.happiness + 15), 100),
          energy: Math.max((pet.energy - 10), 0),
          experience: pet.experience + 5,
          total_games_played: pet.total_games_played + 1,
          last_played_at: new Date().toISOString()
        })
        .eq('id', petId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success('Played with pet! +15 happiness, +5 XP');
    }
  });

  const getEvolutionStage = (pet: any) => {
    const evolutionLevels = pet.pet_types?.evolution_levels || [];
    let stage = 0;
    for (let i = 0; i < evolutionLevels.length; i++) {
      if (pet.level >= evolutionLevels[i].level) {
        stage = i;
      }
    }
    return evolutionLevels[stage] || { name: pet.pet_types?.name };
  };

  const getXPToNextLevel = (level: number) => level * 10;

  if (isLoading) {
    return <div>Loading pets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Pets ({pets?.length || 0})</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adopt Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adopt a New Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createPetMutation.mutate(); }} className="space-y-4">
              <div>
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  placeholder="Enter a name..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="petType">Pet Type</Label>
                <Select value={selectedTypeId} onValueChange={setSelectedTypeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pet type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {petTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} {type.is_premium && '⭐'} {type.price && `(${type.price} credits)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={createPetMutation.isPending}>
                {createPetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adopt Pet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets?.map((pet) => {
          const evolutionStage = getEvolutionStage(pet);
          const xpToNext = getXPToNextLevel(pet.level);
          const xpProgress = (pet.experience % xpToNext) / xpToNext * 100;

          return (
            <Card key={pet.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectPet(pet.id)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{evolutionStage.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Level {pet.level}</span>
                  </div>
                </div>
                <div className="text-3xl">{pet.mood === 'happy' ? '😊' : pet.mood === 'sad' ? '😢' : pet.mood === 'excited' ? '🤩' : pet.mood === 'sleepy' ? '😴' : pet.mood === 'hungry' ? '🍖' : '😐'}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <Progress value={pet.happiness} className="flex-1" />
                  <span className="text-xs font-medium">{pet.happiness}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-orange-500" />
                  <Progress value={pet.hunger} className="flex-1" />
                  <span className="text-xs font-medium">{pet.hunger}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <Progress value={pet.energy} className="flex-1" />
                  <span className="text-xs font-medium">{pet.energy}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <Progress value={xpProgress} className="flex-1" />
                  <span className="text-xs font-medium">{pet.experience % xpToNext}/{xpToNext} XP</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => { e.stopPropagation(); feedPetMutation.mutate(pet.id); }}
                  disabled={pet.hunger >= 100 || feedPetMutation.isPending}
                >
                  <Utensils className="h-4 w-4 mr-1" />
                  Feed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => { e.stopPropagation(); playWithPetMutation.mutate(pet.id); }}
                  disabled={pet.energy < 10 || playWithPetMutation.isPending}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Play
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Age: {Math.floor((new Date().getTime() - new Date(pet.birthday).getTime()) / (1000 * 60 * 60 * 24))} days old
              </div>
            </Card>
          );
        })}
      </div>

      {(!pets || pets.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">You don't have any pets yet.</p>
          <p className="text-sm">Adopt your first companion!</p>
        </div>
      )}
    </div>
  );
};