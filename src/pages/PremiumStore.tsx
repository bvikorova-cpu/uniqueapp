import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { Sparkles, Zap, Star, Crown, Gift, Heart, Palette, Image } from "lucide-react";

const PremiumStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits } = useAICredits();
  const {
    storyEffects,
    livestreamGifts,
    datingGifts,
    premiumBadges,
    premiumThemes,
    premiumAvatars,
    purchaseFeature,
    loading
  } = usePremiumFeatures();
  
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (featureId: string, featureName: string, cost: number) => {
    if (credits.credits_remaining < cost) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits. Purchase more to continue.",
        variant: "destructive",
      });
      navigate('/ai-credits');
      return;
    }

    setPurchasing(true);
    try {
      const success = await purchaseFeature(featureId, featureName, cost);
      if (success) {
        toast({
          title: "Purchase Successful! 🎉",
          description: `${featureName} has been added to your collection.`,
        });
      } else {
        throw new Error("Purchase failed");
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="default">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium Store
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Premium Features
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            Enhance your experience with exclusive premium features
          </p>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-3xl font-bold">{credits.credits_remaining}</span>
                  <span className="text-muted-foreground ml-2">available credits</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => navigate('/ai-credits')}
              >
                Get More Credits
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="badges" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="badges">
              <Crown className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="themes">
              <Palette className="h-4 w-4 mr-2" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="avatars">
              <Image className="h-4 w-4 mr-2" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="story">
              <Sparkles className="h-4 w-4 mr-2" />
              Story
            </TabsTrigger>
            <TabsTrigger value="livestream">
              <Gift className="h-4 w-4 mr-2" />
              Live
            </TabsTrigger>
            <TabsTrigger value="dating">
              <Heart className="h-4 w-4 mr-2" />
              Dating
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumBadges.map((badge) => (
                <Card key={badge.id} className="relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-5 ${getRarityColor(badge.rarity)}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <Badge className={getRarityColor(badge.rarity)}>
                        {badge.rarity}
                      </Badge>
                    </div>
                    <CardTitle>{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{badge.credit_cost} credits</span>
                      <Button
                        disabled={purchasing || loading}
                        onClick={() => handlePurchase(badge.id, badge.name, badge.credit_cost)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Unlock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="themes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumThemes.map((theme) => (
                <Card key={theme.id}>
                  <CardHeader>
                    <div className="h-20 rounded-lg mb-4" 
                         style={{ background: `hsl(${theme.theme_data.primary})` }} 
                    />
                    <CardTitle>{theme.name}</CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{theme.credit_cost} credits</span>
                      <Button
                        disabled={purchasing || loading}
                        onClick={() => handlePurchase(theme.id, theme.name, theme.credit_cost)}
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        Unlock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avatars" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumAvatars.map((avatar) => (
                <Card key={avatar.id} className="relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-5 ${getRarityColor(avatar.rarity)}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2">
                        {avatar.is_animated ? '🎬' : '🖼️'}
                      </div>
                      <Badge className={getRarityColor(avatar.rarity)}>
                        {avatar.rarity}
                      </Badge>
                    </div>
                    <CardTitle>{avatar.name}</CardTitle>
                    <CardDescription>{avatar.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{avatar.credit_cost} credits</span>
                      <Button
                        disabled={purchasing || loading}
                        onClick={() => handlePurchase(avatar.id, avatar.name, avatar.credit_cost)}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Unlock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="story" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storyEffects.map((effect) => (
                <Card key={effect.id}>
                  <CardHeader>
                    <div className="text-4xl mb-2">{effect.icon}</div>
                    <CardTitle>{effect.feature_name}</CardTitle>
                    <CardDescription>{effect.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{effect.credit_cost} credits</span>
                      <Button
                        disabled={purchasing || loading}
                        onClick={() => handlePurchase(effect.id, effect.feature_name, effect.credit_cost)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Unlock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="livestream" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livestreamGifts.map((gift) => (
                <Card key={gift.id}>
                  <CardHeader>
                    <div className="text-4xl mb-2">{gift.icon}</div>
                    <CardTitle>{gift.feature_name}</CardTitle>
                    <CardDescription>{gift.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{gift.credit_cost} credits</span>
                      <Button
                        disabled={purchasing || loading}
                        onClick={() => handlePurchase(gift.id, gift.feature_name, gift.credit_cost)}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Send Gift
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dating" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datingGifts.map((gift) => (
                <Card key={gift.id}>
                  <CardHeader>
                    <div className="text-4xl mb-2">{gift.icon}</div>
                    <CardTitle>{gift.feature_name}</CardTitle>
                    <CardDescription>{gift.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{gift.credit_cost} credits</span>
                      <Button
                        disabled={purchasing || loading}
                        onClick={() => handlePurchase(gift.id, gift.feature_name, gift.credit_cost)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Send Gift
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PremiumStore;