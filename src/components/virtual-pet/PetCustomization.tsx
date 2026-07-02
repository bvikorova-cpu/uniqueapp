import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PetCustomizationProps {
  selectedPetId: string | null;
}

export const PetCustomization = ({ selectedPetId }: PetCustomizationProps) => {
  const queryClient = useQueryClient();

  const { data: ownedAccessories } = useQuery({
    queryKey: ['owned-accessories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_pet_accessories').select('*, pet_accessories(*)').order('acquired_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: selectedPet } = useQuery({
    queryKey: ['selected-pet', selectedPetId],
    queryFn: async () => {
      if (!selectedPetId) return null;
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').eq('id', selectedPetId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPetId
  });

  const equipMutation = useMutation({
    mutationFn: async (accessoryId: string) => {
      if (!selectedPetId) return;
      const currentCustomization = (selectedPet?.customization as any) || {};
      const currentEquipped = currentCustomization.equipped_accessories || [];
      const newEquipped = currentEquipped.includes(accessoryId)
        ? currentEquipped.filter((id: string) => id !== accessoryId)
        : [...currentEquipped, accessoryId];
      const { data, error } = await supabase.from('pets').update({
        customization: { ...currentCustomization, equipped_accessories: newEquipped }
      }).eq('id', selectedPetId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selected-pet', selectedPetId] });
      toast.success('Accessory updated! ✨');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to equip')
  });

  if (!selectedPetId) {
    return (
      <>
        <FloatingHowItWorks title="How Pet Customization works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Palette className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-black mb-2">No Pet Selected</h3>
        <p className="text-sm text-muted-foreground">Select a pet from "My Pets" to customize it!</p>
      </motion.div>
      </>
      );
  }

  const equippedIds = ((selectedPet?.customization as any)?.equipped_accessories || []) as string[];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Customize {selectedPet?.name}
        </h2>
        <p className="text-xs text-muted-foreground capitalize">{selectedPet?.pet_types?.name} • Level {selectedPet?.level}</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <h3 className="font-black text-sm mb-3">Your Accessories ({ownedAccessories?.length || 0})</h3>
          {ownedAccessories && ownedAccessories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ownedAccessories.map((item, i) => {
                const isEquipped = equippedIds.includes(item.accessory_id);
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`cursor-pointer transition-all active:scale-[0.95] ${
                      isEquipped ? 'border-primary/50 bg-primary/5' : 'border-border/40 hover:border-primary/20'
                    }`} onClick={() => equipMutation.mutate(item.accessory_id)}>
                      <CardContent className="p-3 text-center space-y-1">
                        <p className="font-bold text-xs">{item.pet_accessories?.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{item.pet_accessories?.accessory_type}</p>
                        <Badge variant={isEquipped ? 'default' : 'outline'} className="text-[9px]">
                          {isEquipped ? <><Check className="h-2.5 w-2.5 mr-0.5" />Equipped</> : 'Equip'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No accessories yet. Visit the Pet Shop!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
