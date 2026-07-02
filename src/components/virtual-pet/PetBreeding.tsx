import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dna, Loader2, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PetBreedingProps { selectedPetId: string | null; }

export const PetBreeding = ({ selectedPetId }: PetBreedingProps) => {
  const queryClient = useQueryClient();
  const [parent1Id, setParent1Id] = useState(selectedPetId || "");
  const [parent2Id, setParent2Id] = useState("");

  const { data: pets } = useQuery({
    queryKey: ['my-pets-breeding'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').gte('level', 10).order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: breedingPairs } = useQuery({
    queryKey: ['breeding-pairs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pet_breeding').select(`
        *, parent1:parent1_id(name, pet_types(name)),
        parent2:parent2_id(name, pet_types(name)),
        offspring:offspring_id(name, pet_types(name))
      `).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const breedMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('pet_breeding').insert([{
        user_id: user.id, parent1_id: parent1Id, parent2_id: parent2Id, status: 'in_progress'
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-pairs'] });
      toast.success('Breeding started! Check back in 24 hours 🧬');
      setParent1Id(""); setParent2Id("");
    },
    onError: (error: any) => toast.error(error.message || 'Failed to start breeding')
  });

  return (
    <>
      <FloatingHowItWorks title="How Pet Breeding works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Breeding Lab</h2>
        <p className="text-xs text-muted-foreground">Combine two pets (Level 10+) for rare offspring</p>
      </div>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background backdrop-blur-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Dna className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-black text-sm">Start Breeding</h3>
              <p className="text-[10px] text-muted-foreground">Select two compatible parents</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1.5 block">Parent 1</label>
              <Select value={parent1Id} onValueChange={setParent1Id}>
                <SelectTrigger><SelectValue placeholder="Select parent..." /></SelectTrigger>
                <SelectContent>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id} disabled={pet.id === parent2Id}>
                      {pet.name} (Lv{pet.level}) {pet.pet_types?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block">Parent 2</label>
              <Select value={parent2Id} onValueChange={setParent2Id}>
                <SelectTrigger><SelectValue placeholder="Select parent..." /></SelectTrigger>
                <SelectContent>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id} disabled={pet.id === parent1Id}>
                      {pet.name} (Lv{pet.level}) {pet.pet_types?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {parent1Id && parent2Id && (
            <Card className="border-border/20 bg-background/50">
              <CardContent className="p-3 flex items-center justify-center gap-3">
                <span className="font-bold text-xs">{pets?.find(p => p.id === parent1Id)?.name}</span>
                <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
                <span className="font-bold text-xs">{pets?.find(p => p.id === parent2Id)?.name}</span>
              </CardContent>
            </Card>
          )}

          <Button className="w-full gap-2 active:scale-[0.97]" disabled={!parent1Id || !parent2Id || breedMutation.isPending}
            onClick={() => breedMutation.mutate()}>
            {breedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dna className="h-4 w-4" />}
            Start Breeding
          </Button>

          {(!pets || pets.length < 2) && (
            <p className="text-xs text-muted-foreground text-center">You need at least 2 pets at level 10+ to breed.</p>
          )}
        </CardContent>
      </Card>

      {/* Breeding History */}
      <div>
        <h3 className="font-black text-sm mb-3">Breeding History</h3>
        {breedingPairs?.map((pair: any, i: number) => (
          <motion.div key={pair.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 bg-card/80 backdrop-blur-xl mb-2">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-xs">{pair.parent1?.name} × {pair.parent2?.name}</p>
                  <Badge variant="outline" className="text-[9px] mt-1 capitalize">{pair.status}</Badge>
                </div>
                {pair.offspring && (
                  <div className="text-right flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-bold text-primary">{pair.offspring.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {(!breedingPairs || breedingPairs.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-6">No breeding pairs yet.</p>
        )}
      </div>
    </motion.div>
    </>
    );
};
