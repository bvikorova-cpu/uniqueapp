import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { usePremiumStore } from "@/hooks/usePremiumStore";
import { 
  Sparkles, Zap, Star, Crown, Gift, MessageCircle, Heart, 
  TrendingUp, Palette, Image as ImageIcon, Award, Loader2
} from "lucide-react";

const PremiumStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits } = useAICredits();
  const {
    features,
    badges,
    themes,
    avatars,
    userBadges,
    userThemes,
    userAvatars,
    purchaseFeature,
    purchaseBadge,
    purchaseTheme,
    purchaseAvatar,
    loading
  } = usePremiumStore();

  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (
    type: 'feature' | 'badge' | 'theme' | 'avatar',
    id: string,
    name: string,
    cost: number
  ) => {
    if (credits.credits_remaining < cost) {
      toast({
        title: "Not enough credits",
        description: `You need ${cost} credits. You have ${credits.credits_remaining}.`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(id);
    try {
      let success = false;
      
      switch (type) {
        case 'feature':
          success = await purchaseFeature(id, name, cost);
          break;
        case 'badge':
          success = await purchaseBadge(id, cost);
          break;
        case 'theme':
          success = await purchaseTheme(id, cost);
          break;
        case 'avatar':
          success = await purchaseAvatar(id, cost);
          break;
      }

      if (success) {
        toast({
          title: "Purchase successful!",
          description: `You've unlocked ${name}`,
        });
      } else {
        throw new Error("Purchase failed");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'epic': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'rare': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="default">
            <Crown className="h-3 w-3 mr-1" />
            Premium Store
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Premium Features
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            Enhance your experience with exclusive premium items
          </p>

          {/* Credits Display */}
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-3xl font-bold">{credits.credits_remaining}</span>
                  <span className="text-muted-foreground ml-2">credits available</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/ai-credits')}
              >
                Buy More Credits
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="features" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">
              <Zap className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="themes">
              <Palette className="h-4 w-4 mr-2" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="avatars">
              <ImageIcon className="h-4 w-4 mr-2" />
              Avatars
            </TabsTrigger>
          </TabsList>

          {/* Premium Features */}
          <TabsContent value="features" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{feature.feature_name}</CardTitle>
                          <CardDescription className="text-sm">{feature.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-bold">{feature.credit_cost}</span>
                        <span className="text-sm text-muted-foreground">credits</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePurchase('feature', feature.id, feature.feature_name, feature.credit_cost)}
                        disabled={purchasing === feature.id}
                      >
                        {purchasing === feature.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Unlock'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Premium Badges */}
          <TabsContent value="badges" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {badges.map((badge) => {
                const owned = userBadges.some(ub => ub.badge_id === badge.id);
                return (
                  <Card key={badge.id} className={owned ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        <span className="text-4xl">{badge.icon}</span>
                      </div>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription className="text-sm">{badge.description}</CardDescription>
                      <Badge variant="outline" className={getRarityBadge(badge.rarity)}>
                        {badge.rarity}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-bold">{badge.credit_cost}</span>
                        </div>
                        {owned ? (
                          <Badge variant="secondary">Owned</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('badge', badge.id, badge.name, badge.credit_cost)}
                            disabled={purchasing === badge.id}
                          >
                            {purchasing === badge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Unlock'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Premium Themes */}
          <TabsContent value="themes" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme, index) => {
                const owned = userThemes.some(ut => ut.theme_id === theme.id);
                const themeGradients = [
                  'from-purple-500 via-pink-500 to-red-500',
                  'from-blue-500 via-cyan-500 to-teal-500',
                  'from-orange-500 via-red-500 to-pink-500',
                  'from-green-500 via-emerald-500 to-teal-500',
                  'from-indigo-500 via-purple-500 to-pink-500',
                  'from-yellow-500 via-orange-500 to-red-500'
                ];
                const gradient = themeGradients[index % themeGradients.length];
                
                return (
                  <Card key={theme.id} className={owned ? 'ring-2 ring-primary' : ''}>
                    <CardHeader>
                      <div className="mb-3">
                        <div className={`h-32 rounded-lg bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-gray-900">
                              Theme Preview
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                      <CardDescription>{theme.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-bold">{theme.credit_cost}</span>
                        </div>
                        {owned ? (
                          <Badge variant="secondary">Owned</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('theme', theme.id, theme.name, theme.credit_cost)}
                            disabled={purchasing === theme.id}
                          >
                            {purchasing === theme.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Unlock'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Premium Avatars */}
          <TabsContent value="avatars" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {avatars.map((avatar) => {
                const owned = userAvatars.some(ua => ua.avatar_id === avatar.id);
                return (
                  <Card key={avatar.id} className={owned ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${
                          avatar.rarity === 'legendary' ? 'from-yellow-400 to-orange-500' :
                          avatar.rarity === 'epic' ? 'from-purple-400 to-pink-500' :
                          avatar.rarity === 'rare' ? 'from-blue-400 to-cyan-500' :
                          'from-gray-400 to-gray-500'
                        } flex items-center justify-center ${avatar.is_animated ? 'animate-pulse' : ''}`}>
                          <Crown className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{avatar.name}</CardTitle>
                      <CardDescription className="text-sm">{avatar.description}</CardDescription>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Badge variant="outline" className={getRarityBadge(avatar.rarity)}>
                          {avatar.rarity}
                        </Badge>
                        {avatar.is_animated && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Animated
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-bold">{avatar.credit_cost}</span>
                        </div>
                        {owned ? (
                          <Badge variant="secondary">Owned</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('avatar', avatar.id, avatar.name, avatar.credit_cost)}
                            disabled={purchasing === avatar.id}
                          >
                            {purchasing === avatar.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Unlock'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PremiumStore;
