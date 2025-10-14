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
    activateTheme,
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
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'rare': return 'bg-purple-500 text-white';
      case 'common': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'rare': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'common': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
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

          {/* Digital Collectibles - Badges */}
          <TabsContent value="badges" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const owned = userBadges.some(ub => ub.badge_id === badge.id);
                const isSoldOut = badge.is_limited_edition && badge.total_supply && (badge.minted_count || 0) >= badge.total_supply;
                
                return (
                  <Card key={badge.id} className={`overflow-hidden ${owned ? 'ring-2 ring-primary' : ''}`}>
                    <div className={`h-2 ${getRarityGradient(badge.rarity)}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-5xl">{badge.icon}</div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getRarityBadge(badge.rarity)}>
                            {badge.rarity.toUpperCase()}
                          </Badge>
                          {badge.is_limited_edition && (
                            <Badge variant="outline" className="text-xs">
                              LIMITED
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{badge.name}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                      {badge.season && (
                        <p className="text-xs text-primary mt-2">📅 {badge.season}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {badge.is_limited_edition && badge.total_supply && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Supply:</span>
                            <span className="font-semibold">
                              {badge.minted_count || 0} / {badge.total_supply}
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getRarityGradient(badge.rarity)}`}
                              style={{ width: `${((badge.minted_count || 0) / badge.total_supply) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-lg font-bold">{badge.credit_cost}</span>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                        {owned ? (
                          <Badge className="bg-primary">Vlastníš</Badge>
                        ) : isSoldOut ? (
                          <Badge variant="destructive">Vypredané</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('badge', badge.id, badge.name, badge.credit_cost)}
                            disabled={purchasing === badge.id}
                          >
                            {purchasing === badge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Kúpiť'
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
                const userTheme = userThemes.find(ut => ut.theme_id === theme.id);
                const owned = !!userTheme;
                const isActive = userTheme?.is_active;
                
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
                  <Card key={theme.id} className={isActive ? 'ring-2 ring-primary' : owned ? 'ring-1 ring-muted' : ''}>
                    <CardHeader>
                      <div className="mb-3">
                        <div className={`h-32 rounded-lg bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-gray-900">
                              Theme Preview
                            </div>
                          </div>
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-primary">Active</Badge>
                            </div>
                          )}
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
                          isActive ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => activateTheme(theme.id)}
                            >
                              Activate
                            </Button>
                          )
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

          {/* Digital Collectibles - Avatars */}
          <TabsContent value="avatars" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {avatars.map((avatar) => {
                const owned = userAvatars.some(ua => ua.avatar_id === avatar.id);
                const isSoldOut = avatar.is_limited_edition && avatar.total_supply && (avatar.minted_count || 0) >= avatar.total_supply;
                
                return (
                  <Card key={avatar.id} className={`overflow-hidden ${owned ? 'ring-2 ring-primary' : ''}`}>
                    <div className={`h-2 ${getRarityGradient(avatar.rarity)}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-20 h-20 rounded-full ${getRarityGradient(avatar.rarity)} flex items-center justify-center ${avatar.is_animated ? 'animate-pulse' : ''}`}>
                          <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getRarityBadge(avatar.rarity)}>
                            {avatar.rarity.toUpperCase()}
                          </Badge>
                          {avatar.is_limited_edition && (
                            <Badge variant="outline" className="text-xs">
                              LIMITED
                            </Badge>
                          )}
                          {avatar.is_animated && (
                            <Badge variant="outline" className="text-xs">
                              ANIMATED
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{avatar.name}</CardTitle>
                      <CardDescription>{avatar.description}</CardDescription>
                      {avatar.season && (
                        <p className="text-xs text-primary mt-2">📅 {avatar.season}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {avatar.is_limited_edition && avatar.total_supply && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Supply:</span>
                            <span className="font-semibold">
                              {avatar.minted_count || 0} / {avatar.total_supply}
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getRarityGradient(avatar.rarity)}`}
                              style={{ width: `${((avatar.minted_count || 0) / avatar.total_supply) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-lg font-bold">{avatar.credit_cost}</span>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                        {owned ? (
                          <Badge className="bg-primary">Vlastníš</Badge>
                        ) : isSoldOut ? (
                          <Badge variant="destructive">Vypredané</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('avatar', avatar.id, avatar.name, avatar.credit_cost)}
                            disabled={purchasing === avatar.id}
                          >
                            {purchasing === avatar.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Kúpiť'
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
