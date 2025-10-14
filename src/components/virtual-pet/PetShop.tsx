import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

export const PetShop = () => {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();

  const { data: accessories } = useQuery({
    queryKey: ['accessories-shop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_accessories')
        .select('*')
        .order('rarity', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500';
      case 'epic': return 'text-purple-500';
      case 'rare': return 'text-blue-500';
      case 'uncommon': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const purchaseMutation = useMutation({
    mutationFn: async (accessory: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const creditsNeeded = accessory.price;
      if (credits.credits_remaining < creditsNeeded) {
        throw new Error('Not enough credits');
      }

      // Deduct credits
      const { error: creditError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: credits.credits_remaining - creditsNeeded,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (creditError) throw creditError;

      // Log usage
      await supabase
        .from('ai_usage_history')
        .insert({
          user_id: user.id,
          usage_type: 'custom_generation',
          credits_used: creditsNeeded,
          description: `Purchased ${accessory.name}`,
        });

      const { data, error } = await supabase
        .from('user_pet_accessories')
        .insert([{
          user_id: user.id,
          accessory_id: accessory.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, accessory) => {
      queryClient.invalidateQueries({ queryKey: ['owned-accessories'] });
      toast.success(`Purchased ${accessory.name}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to purchase accessory');
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pet Accessory Shop</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessories?.map((item) => (
          <Card key={item.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.accessory_type}</p>
              </div>
              {item.is_premium && <Star className="h-5 w-5 text-yellow-500" />}
            </div>

            <p className="text-sm">{item.description}</p>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className={getRarityColor(item.rarity)}>
                {item.rarity}
              </Badge>
              <span className="font-bold">${item.price}</span>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={() => purchaseMutation.mutate(item)}
              disabled={purchaseMutation.isPending || credits.credits_remaining < item.price}
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase ({item.price} credits)
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};