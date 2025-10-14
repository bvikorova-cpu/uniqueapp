import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface PetCustomizationProps {
  selectedPetId: string | null;
}

export const PetCustomization = ({ selectedPetId }: PetCustomizationProps) => {
  const { data: ownedAccessories } = useQuery({
    queryKey: ['owned-accessories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_pet_accessories')
        .select('*, pet_accessories(*)')
        .order('acquired_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: selectedPet } = useQuery({
    queryKey: ['selected-pet', selectedPetId],
    queryFn: async () => {
      if (!selectedPetId) return null;
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .eq('id', selectedPetId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPetId
  });

  if (!selectedPetId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Select a pet from "My Pets" tab to customize it!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customize {selectedPet?.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">{selectedPet?.pet_types?.name}</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Your Accessories ({ownedAccessories?.length || 0})</h3>
        
        {ownedAccessories && ownedAccessories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {ownedAccessories.map((item) => (
              <Card key={item.id} className="p-3 space-y-2">
                <div className="text-sm font-medium">{item.pet_accessories?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{item.pet_accessories?.accessory_type}</div>
                <Button size="sm" variant="outline" className="w-full">
                  Equip
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No accessories yet. Visit the shop!</p>
        )}
      </Card>
    </div>
  );
};