import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, Sparkles, Star, Crown, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAICredits } from "@/hooks/useAICredits";

interface MysteryBox {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

interface UserBox {
  id: string;
  box_id: string;
  is_opened: boolean;
  purchased_at: string;
  mystery_boxes: MysteryBox;
}

interface Reward {
  id: string;
  item_name: string;
  rarity: string;
  item_type: string;
  expiresAt: string;
  item_data: any;
}

const MysteryBox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, loading: creditsLoading, refresh: refreshCredits } = useAICredits();
  
  const [boxes, setBoxes] = useState<MysteryBox[]>([]);
  const [userBoxes, setUserBoxes] = useState<UserBox[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedReward, setRevealedReward] = useState<Reward | null>(null);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
  };

  const loadData = async () => {
    try {
      const [boxesRes, userBoxesRes, rewardsRes] = await Promise.all([
        supabase.from('mystery_boxes').select('*').order('price'),
        supabase.from('user_mystery_boxes').select('*, mystery_boxes(*)'),
        supabase.from('mystery_box_rewards').select('*, mystery_box_items(*)').eq('is_active', true),
      ]);

      if (boxesRes.data) setBoxes(boxesRes.data);
      if (userBoxesRes.data) setUserBoxes(userBoxesRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (box: MysteryBox) => {
    try {
      setPurchasing(box.id);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const currentCredits = typeof credits === 'number' ? credits : credits.credits_remaining;

      if (currentCredits < box.price) {
        toast({
          title: "Nedostatok kreditov",
          description: `Potrebujete ${box.price} kreditov. Presmerujeme vás na nákup.`,
          variant: "destructive",
        });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }

      // Deduct credits
      const newCredits = currentCredits - box.price;
      const { error: updateError } = await supabase
        .from('ai_credits')
        .update({ credits_remaining: newCredits })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create user box
      const { error: boxError } = await supabase
        .from('user_mystery_boxes')
        .insert({
          user_id: user.id,
          box_id: box.id,
        });

      if (boxError) throw boxError;

      // Log usage
      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: 'mystery_box_purchase',
        credits_used: box.price,
        description: `Purchased ${box.name}`,
      });

      toast({
        title: "Mystery Box zakúpený!",
        description: `${box.name} bol pridaný do vašej zbierky.`,
      });

      await Promise.all([loadData(), refreshCredits()]);
    } catch (error) {
      console.error('Error purchasing box:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa zakúpiť Mystery Box.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handleOpenBox = async (userBox: UserBox) => {
    try {
      setOpening(userBox.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('open-mystery-box', {
        body: { userBoxId: userBox.id },
      });

      if (error) throw error;

      if (data.success) {
        setRevealedReward(data.reward);
        await loadData();
        
        setTimeout(() => {
          toast({
            title: "🎉 Výhra!",
            description: `Získali ste: ${data.reward.item_name}`,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error opening box:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa otvoriť Mystery Box.",
        variant: "destructive",
      });
    } finally {
      setOpening(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4" />;
      case 'epic': return <Star className="h-4 w-4" />;
      case 'rare': return <Sparkles className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading || creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="h-12 w-12 text-primary animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Mystery Box Subscriptions
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mesačné mystery boxy s exkluzívnym digitálnym obsahom
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Gacha-style systém pre vzácne items</span>
          </div>
        </div>

        {/* Revealed Reward Modal */}
        {revealedReward && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full animate-in zoom-in duration-500">
              <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className={`p-6 rounded-full ${getRarityColor(revealedReward.rarity)} animate-pulse`}>
                    {getRarityIcon(revealedReward.rarity)}
                  </div>
                </div>
                <CardTitle className="text-2xl">🎉 Výhra!</CardTitle>
                <CardDescription>Získali ste nový item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{revealedReward.item_name}</h3>
                  <Badge className={getRarityColor(revealedReward.rarity)}>
                    {revealedReward.rarity.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Typ: {revealedReward.item_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Platnosť do: {new Date(revealedReward.expiresAt).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <Button onClick={() => setRevealedReward(null)} className="w-full">
                  Pokračovať
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Boxes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Dostupné Mystery Boxy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boxes.map((box) => (
              <Card key={box.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">{box.icon}</div>
                  <CardTitle>{box.name}</CardTitle>
                  <CardDescription>{box.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{box.price}</span>
                    <span className="text-muted-foreground">kreditov</span>
                  </div>
                  <Button
                    onClick={() => handlePurchase(box)}
                    disabled={purchasing === box.id}
                    className="w-full"
                  >
                    {purchasing === box.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Nakupujem...
                      </>
                    ) : (
                      'Kúpiť Mystery Box'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User's Boxes */}
        {userBoxes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Vaše Mystery Boxy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userBoxes.filter(ub => !ub.is_opened).map((userBox) => (
                <Card key={userBox.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">{userBox.mystery_boxes.icon}</div>
                    <CardTitle>{userBox.mystery_boxes.name}</CardTitle>
                    <CardDescription>
                      Zakúpené: {new Date(userBox.purchased_at).toLocaleDateString('sk-SK')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleOpenBox(userBox)}
                      disabled={opening === userBox.id}
                      className="w-full"
                      variant="default"
                    >
                      {opening === userBox.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Otváram...
                        </>
                      ) : (
                        'Otvoriť Box'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Rewards */}
        {rewards.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Vaše Aktívne Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">{reward.mystery_box_items.item_name}</CardTitle>
                      <Badge className={getRarityColor(reward.mystery_box_items.rarity)}>
                        {reward.mystery_box_items.rarity}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        {getRarityIcon(reward.mystery_box_items.rarity)}
                        <span>{reward.mystery_box_items.item_type}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Platnosť do: {new Date(reward.expires_at).toLocaleDateString('sk-SK')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MysteryBox;