import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Star, Sword, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";

export const PetShop = () => {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  const navigate = useNavigate();

  const { data: accessories } = useQuery({
    queryKey: ['accessories-shop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_accessories')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: mysteryBoxes } = useQuery({
    queryKey: ['mystery-boxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_mystery_boxes')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500';
      case 'epic': return 'text-purple-500 border-purple-500';
      case 'rare': return 'text-blue-500 border-blue-500';
      case 'uncommon': return 'text-green-500 border-green-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const getBattlePower = (effect: any) => {
    if (effect && typeof effect === 'object' && effect.battle_power) {
      return effect.battle_power;
    }
    return 0;
  };

  const handlePurchase = (item: any, type: 'accessory' | 'mystery') => {
    const creditsNeeded = item.price;
    if (credits.credits_remaining < creditsNeeded) {
      toast.error('Not enough credits. Redirecting to purchase...');
      setTimeout(() => navigate('/ai-credits'), 1500);
      return;
    }
    if (type === 'accessory') {
      purchaseMutation.mutate(item);
    } else {
      openMysteryBoxMutation.mutate(item);
    }
  };

  const purchaseMutation = useMutation({
    mutationFn: async (accessory: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: creditError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: credits.credits_remaining - accessory.price,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (creditError) throw creditError;

      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: 'custom_generation',
        credits_used: accessory.price,
        description: `Purchased ${accessory.name}`,
      });

      const { data, error } = await supabase
        .from('user_pet_accessories')
        .insert([{ user_id: user.id, accessory_id: accessory.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, accessory) => {
      queryClient.invalidateQueries({ queryKey: ['owned-accessories'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success(`Purchased ${accessory.name}!`);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to purchase')
  });

  const openMysteryBoxMutation = useMutation({
    mutationFn: async (box: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: creditError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: credits.credits_remaining - box.price,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (creditError) throw creditError;

      // Random reward from box
      const rewards = box.possible_rewards as string[];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: 'custom_generation',
        credits_used: box.price,
        description: `Opened ${box.name} - Got: ${reward}`,
      });

      return { box, reward };
    },
    onSuccess: ({ box, reward }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success(`🎉 Opened ${box.name}! You got: ${reward.replace('_', ' ')}`);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to open box')
  });

  const battleItems = accessories?.filter(a => getBattlePower(a.effect) > 0) || [];
  const cosmeticItems = accessories?.filter(a => getBattlePower(a.effect) === 0) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Pet Shop</h2>
      
      <Tabs defaultValue="battle" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="battle" className="gap-1 text-xs sm:text-sm">
            <Sword className="h-3 w-3 sm:h-4 sm:w-4" /> Battle Gear
          </TabsTrigger>
          <TabsTrigger value="cosmetic" className="gap-1 text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" /> Cosmetics
          </TabsTrigger>
          <TabsTrigger value="mystery" className="gap-1 text-xs sm:text-sm">
            <Package className="h-3 w-3 sm:h-4 sm:w-4" /> Mystery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battle" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {battleItems.map((item) => (
              <Card key={item.id} className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{item.accessory_type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sword className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-bold text-red-500">+{getBattlePower(item.effect)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                  <span className="font-bold text-sm">{item.price} credits</span>
                </div>
                <Button size="sm" className="w-full gap-1" onClick={() => handlePurchase(item, 'accessory')} disabled={purchaseMutation.isPending}>
                  <ShoppingCart className="h-3 w-3" />
                  {credits.credits_remaining < item.price ? 'Buy Credits' : 'Purchase'}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cosmetic" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cosmeticItems.map((item) => (
              <Card key={item.id} className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{item.accessory_type}</p>
                  </div>
                  {item.is_premium && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                  <span className="font-bold text-sm">{item.price} credits</span>
                </div>
                <Button size="sm" className="w-full gap-1" onClick={() => handlePurchase(item, 'accessory')} disabled={purchaseMutation.isPending}>
                  <ShoppingCart className="h-3 w-3" />
                  {credits.credits_remaining < item.price ? 'Buy Credits' : 'Purchase'}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mystery" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mysteryBoxes?.map((box: any) => (
              <Card key={box.id} className={`p-3 space-y-2 ${box.rarity === 'legendary' ? 'border-yellow-500 bg-yellow-500/5' : box.rarity === 'epic' ? 'border-purple-500 bg-purple-500/5' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{box.image_emoji}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{box.name}</h3>
                      <Badge variant="outline" className={getRarityColor(box.rarity)}>{box.rarity}</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{box.description}</p>
                <div className="text-right">
                  <span className="font-bold text-sm">{box.price} credits</span>
                </div>
                <Button size="sm" className="w-full gap-1" onClick={() => handlePurchase(box, 'mystery')} disabled={openMysteryBoxMutation.isPending}>
                  <Package className="h-3 w-3" />
                  {credits.credits_remaining < box.price ? 'Buy Credits' : 'Open Box'}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
