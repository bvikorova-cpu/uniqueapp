import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dna, Loader2 } from "lucide-react";

export const PetBreeding = () => {
  const [parent1Id, setParent1Id] = useState("");
  const [parent2Id, setParent2Id] = useState("");

  const { data: pets } = useQuery({
    queryKey: ['my-pets-breeding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .gte('level', 10)
        .order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: breedingPairs } = useQuery({
    queryKey: ['breeding-pairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_breeding')
        .select(`
          *,
          parent1:parent1_id(name, pet_types(name)),
          parent2:parent2_id(name, pet_types(name)),
          offspring:offspring_id(name, pet_types(name))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pet Breeding</h2>
      
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Dna className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Start Breeding</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Breed two pets (level 10+) to create a unique offspring!
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Parent 1</label>
            <Select value={parent1Id} onValueChange={setParent1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select first parent..." />
              </SelectTrigger>
              <SelectContent>
                {pets?.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id} disabled={pet.id === parent2Id}>
                    {pet.name} (Lv{pet.level}) - {pet.pet_types?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Parent 2</label>
            <Select value={parent2Id} onValueChange={setParent2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select second parent..." />
              </SelectTrigger>
              <SelectContent>
                {pets?.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id} disabled={pet.id === parent1Id}>
                    {pet.name} (Lv{pet.level}) - {pet.pet_types?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full gap-2" disabled={!parent1Id || !parent2Id}>
          <Dna className="h-4 w-4" />
          Start Breeding
        </Button>

        {!pets || pets.length < 2 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            You need at least 2 pets at level 10+ to breed.
          </p>
        )}
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Breeding History</h3>
        
        {breedingPairs?.map((pair: any) => (
          <Card key={pair.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-medium">
                  {pair.parent1?.name} × {pair.parent2?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="capitalize">{pair.status}</span>
                </p>
              </div>
              {pair.offspring && (
                <div className="text-right">
                  <p className="text-sm font-medium">Offspring:</p>
                  <p className="text-sm text-primary">{pair.offspring.name}</p>
                </div>
              )}
            </div>
          </Card>
        ))}

        {(!breedingPairs || breedingPairs.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No breeding pairs yet. Start your first breeding above!
          </p>
        )}
      </div>
    </div>
  );
};