import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Star, Sword, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const PetShop = () => {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  const navigate = useNavigate();

  const { data: accessories } = useQuery({
    queryKey: ['accessories-shop'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pet_accessories').select('*').order('price', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: mysteryBoxes } = useQuery({
    queryKey: ['mystery-boxes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pet_mystery_boxes').select('*').order('price', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      case 'epic': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      case 'rare': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'uncommon': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-muted-foreground border-border/30';
    }
  };

  const getBattlePower = (effect: any) => (effect && typeof effect === 'object' && effect.battle_power) ? effect.battle_power : 0;

  const handlePurchase = (item: any, type: 'accessory' | 'mystery') => {
    if (credits.credits_remaining < item.price) {
      toast.error('Not enough credits');
      setTimeout(() => navigate('/ai-credits'), 1500);
      return;
    }
    if (type === 'accessory') purchaseMutation.mutate(item); else openMysteryBoxMutation.mutate(item);
  };

  const purchaseMutation = useMutation({
    mutationFn: async (accessory: any) => {
      const { data, error } = await supabase.functions.invoke('pet-purchase-item', {
        body: { itemType: 'accessory', itemId: accessory.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { data, accessory };
    },
    onSuccess: ({ accessory }) => {
      queryClient.invalidateQueries({ queryKey: ['owned-accessories'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success(`Purchased ${accessory.name}! 🛍️`);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to purchase'),
  });

  const openMysteryBoxMutation = useMutation({
    mutationFn: async (box: any) => {
      const { data, error } = await supabase.functions.invoke('pet-purchase-item', {
        body: { itemType: 'mystery', itemId: box.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { data, box };
    },
    onSuccess: ({ data, box }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      const reward = data?.reward?.reward ?? 'a surprise';
      toast.success(`🎉 Opened ${box.name}! You got: ${String(reward).replace(/_/g, ' ')}`);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to open box'),
  });

  const battleItems = accessories?.filter(a => getBattlePower(a.effect) > 0) || [];
  const cosmeticItems = accessories?.filter(a => getBattlePower(a.effect) === 0) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Pet Shop</h2>
        <p className="text-xs text-muted-foreground">Buy accessories, battle gear & mystery boxes</p>
      </div>

      <Tabs defaultValue="battle" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="battle" className="gap-1 text-xs"><Sword className="h-3 w-3" /> Battle Gear</TabsTrigger>
          <TabsTrigger value="cosmetic" className="gap-1 text-xs"><Sparkles className="h-3 w-3" /> Cosmetics</TabsTrigger>
          <TabsTrigger value="mystery" className="gap-1 text-xs"><Package className="h-3 w-3" /> Mystery</TabsTrigger>
        </TabsList>

        <TabsContent value="battle" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {battleItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/40 bg-card/80 backdrop-blur-xl hover:border-primary/30 transition-all">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-[10px] text-muted-foreground capitalize">{item.accessory_type}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-red-500/10 rounded-full px-2 py-0.5">
                        <Sword className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-black text-red-500">+{getBattlePower(item.effect)}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[9px] ${getRarityColor(item.rarity)}`}>{item.rarity}</Badge>
                      <span className="font-black text-sm">{item.price} cr</span>
                    </div>
                    <Button size="sm" className="w-full gap-1 active:scale-[0.97]" onClick={() => handlePurchase(item, 'accessory')} disabled={purchaseMutation.isPending}>
                      <ShoppingCart className="h-3 w-3" />
                      {credits.credits_remaining < item.price ? 'Buy Credits' : 'Purchase'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cosmetic" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cosmeticItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/40 bg-card/80 backdrop-blur-xl hover:border-primary/30 transition-all">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-[10px] text-muted-foreground capitalize">{item.accessory_type}</p>
                      </div>
                      {item.is_premium && <Star className="h-4 w-4 text-amber-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[9px] ${getRarityColor(item.rarity)}`}>{item.rarity}</Badge>
                      <span className="font-black text-sm">{item.price} cr</span>
                    </div>
                    <Button size="sm" className="w-full gap-1 active:scale-[0.97]" onClick={() => handlePurchase(item, 'accessory')} disabled={purchaseMutation.isPending}>
                      <ShoppingCart className="h-3 w-3" />
                      {credits.credits_remaining < item.price ? 'Buy Credits' : 'Purchase'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mystery" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mysteryBoxes?.map((box: any, i: number) => (
              <motion.div key={box.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className={`border-border/40 bg-card/80 backdrop-blur-xl hover:border-primary/30 transition-all ${
                  box.rarity === 'legendary' ? 'border-amber-500/30' : box.rarity === 'epic' ? 'border-purple-500/30' : ''
                }`}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{box.image_emoji}</span>
                      <div>
                        <h3 className="font-bold text-sm">{box.name}</h3>
                        <Badge variant="outline" className={`text-[9px] ${getRarityColor(box.rarity)}`}>{box.rarity}</Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{box.description}</p>
                    <div className="text-right"><span className="font-black text-sm">{box.price} cr</span></div>
                    <Button size="sm" className="w-full gap-1 active:scale-[0.97]" onClick={() => handlePurchase(box, 'mystery')} disabled={openMysteryBoxMutation.isPending}>
                      <Package className="h-3 w-3" />
                      {credits.credits_remaining < box.price ? 'Buy Credits' : 'Open Box'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
