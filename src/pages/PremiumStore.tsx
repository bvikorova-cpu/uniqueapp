import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { usePremiumStore } from "@/hooks/usePremiumStore";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Zap, Star, Crown, Gift, MessageCircle, Heart, 
  TrendingUp, Palette, Image as ImageIcon, Award, Loader2, Lock, Eye, Rocket
} from "lucide-react";

// Level requirements for items (XP unlocks right to buy, not currency)
const LEVEL_REQUIREMENTS: Record<string, number> = {
  // Features
  'visibility_boost': 5,
  'featured_listing': 10,
  'employer_branding': 15,
  'premium_analytics': 20,
  // Badges by rarity
  'common': 1,
  'rare': 10,
  'legendary': 20,
  // Themes
  'basic_theme': 5,
  'premium_theme': 15,
  // Avatars
  'basic_avatar': 5,
  'animated_avatar': 20,
};

// Visibility boosters - main revenue items
const VISIBILITY_BOOSTERS = [
  { id: 'boost_24h', name: '24h Visibility Boost', description: 'Double your listing views for 24 hours', credits: 10, levelRequired: 5, icon: '🚀', multiplier: '2x' },
  { id: 'boost_7d', name: '7-Day Featured', description: 'Featured placement for a full week', credits: 50, levelRequired: 10, icon: '⭐', multiplier: '5x' },
  { id: 'featured_employer', name: 'Featured Employer Badge', description: 'Stand out as a top employer', credits: 100, levelRequired: 15, icon: '👑', multiplier: '10x' },
  { id: 'spotlight_30d', name: '30-Day Premium Spotlight', description: 'Maximum visibility for 30 days', credits: 150, levelRequired: 20, icon: '💎', multiplier: '20x' },
];

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
  const [userLevel, setUserLevel] = useState(1);

  // Fetch user level for gating
  useState(() => {
    const fetchLevel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_points')
          .select('level')
          .eq('user_id', user.id)
          .single();
        if (data) setUserLevel(data.level || 1);
      }
    };
    fetchLevel();
  });

  const getLevelRequirement = (type: string, rarity?: string): number => {
    if (type === 'visibility') return LEVEL_REQUIREMENTS['visibility_boost'] || 5;
    if (rarity) return LEVEL_REQUIREMENTS[rarity] || 1;
    return LEVEL_REQUIREMENTS[type] || 1;
  };

  const canPurchase = (levelRequired: number): boolean => {
    return userLevel >= levelRequired;
  };

  const handlePurchase = async (
    type: 'feature' | 'badge' | 'theme' | 'avatar' | 'visibility',
    id: string,
    name: string,
    cost: number,
    levelRequired: number = 1
  ) => {
    // Check level requirement first
    if (!canPurchase(levelRequired)) {
      toast({
        title: "Level Required",
        description: `Reach Level ${levelRequired} to unlock the right to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    if (credits.credits_remaining < cost) {
      toast({
        title: "Not enough credits",
        description: `You need ${cost} credits. You have ${credits.credits_remaining}. XP cannot be used for purchases.`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(id);
    try {
      let success = false;
      
      switch (type) {
        case 'feature':
        case 'visibility':
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
          
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Unlock{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Premium Features
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            Enhance your experience with exclusive premium items
          </p>

          {/* Credits & Level Display */}
          <Card className="max-w-lg mx-auto backdrop-blur-xl bg-card/80 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-3xl font-bold">{credits.credits_remaining}</span>
                    <span className="text-muted-foreground ml-2">credits</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Star className="h-4 w-4 text-purple-500" />
                  <span className="font-bold text-purple-600">Level {userLevel}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                XP unlocks the <strong>right to buy</strong> items • Credits are the currency
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate('/ai-credits')}
              >
                Buy More Credits
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visibility" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visibility">
              <Eye className="h-4 w-4 mr-2" />
              Visibility
            </TabsTrigger>
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

          {/* VISIBILITY BOOSTERS - Main Revenue Driver */}
          <TabsContent value="visibility" className="mt-6">
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="h-5 w-5 text-green-500" />
                <h3 className="font-bold text-lg">Visibility Boosters</h3>
                <Badge className="bg-green-500 text-white">Primary Revenue</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Increase your listing exposure and get more views. Higher visibility = more responses = more success!
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {VISIBILITY_BOOSTERS.map((boost) => {
                const isLocked = userLevel < boost.levelRequired;
                const levelProgress = Math.min(100, (userLevel / boost.levelRequired) * 100);
                
                return (
                  <Card 
                    key={boost.id} 
                    className={`overflow-hidden backdrop-blur-xl ${
                      isLocked 
                        ? 'bg-muted/50 border-muted opacity-75' 
                        : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{boost.icon}</span>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {boost.name}
                              {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            </CardTitle>
                            <CardDescription>{boost.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">{boost.multiplier} Views</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Level Required</span>
                            <span className="font-medium">{userLevel} / {boost.levelRequired}</span>
                          </div>
                          <Progress value={levelProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Reach Level {boost.levelRequired} to unlock the right to purchase
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-xl font-bold">{boost.credits}</span>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase('visibility', boost.id, boost.name, boost.credits, boost.levelRequired)}
                          disabled={purchasing === boost.id || isLocked}
                          className={isLocked ? 'opacity-50' : 'bg-green-600 hover:bg-green-700'}
                        >
                          {purchasing === boost.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isLocked ? (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Locked
                            </>
                          ) : (
                            'Boost Now'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

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

          {/* Digital Collectibles - Badges with Level Gating */}
          <TabsContent value="badges" className="mt-6">
            <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Badges require specific levels: <strong>Common (Lvl 1)</strong> • <strong>Rare (Lvl 10)</strong> • <strong>Legendary (Lvl 20)</strong></span>
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const owned = userBadges.some(ub => ub.badge_id === badge.id);
                const levelRequired = getLevelRequirement('badge', badge.rarity);
                const isLocked = userLevel < levelRequired;
                
                return (
                  <Card key={badge.id} className={`overflow-hidden ${owned ? 'ring-2 ring-primary' : ''} ${isLocked ? 'opacity-75' : ''}`}>
                    <div className={`h-2 ${getRarityGradient(badge.rarity)}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-5xl">{badge.icon}</div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getRarityBadge(badge.rarity)}>
                            {badge.rarity.toUpperCase()}
                          </Badge>
                          {isLocked && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Lvl {levelRequired}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {badge.name}
                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-lg font-bold">{badge.credit_cost}</span>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                        {owned ? (
                          <Badge className="bg-primary">Owned</Badge>
                        ) : isLocked ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Lock className="h-3 w-3 mr-1" />
                            Level {levelRequired}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('badge', badge.id, badge.name, badge.credit_cost, levelRequired)}
                            disabled={purchasing === badge.id}
                          >
                            {purchasing === badge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Buy'
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

          {/* Digital Collectibles - Avatars with Level Gating */}
          <TabsContent value="avatars" className="mt-6">
            <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Avatars: <strong>Basic (Lvl 5)</strong> • <strong>Animated (Lvl 20)</strong> - Rarity also applies</span>
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {avatars.map((avatar) => {
                const owned = userAvatars.some(ua => ua.avatar_id === avatar.id);
                const levelRequired = avatar.is_animated ? 20 : getLevelRequirement('avatar', avatar.rarity);
                const isLocked = userLevel < levelRequired;
                
                return (
                  <Card key={avatar.id} className={`overflow-hidden ${owned ? 'ring-2 ring-primary' : ''} ${isLocked ? 'opacity-75' : ''}`}>
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
                          {avatar.is_animated && (
                            <Badge variant="outline" className="text-xs">
                              ANIMATED
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Lvl {levelRequired}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {avatar.name}
                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription>{avatar.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-lg font-bold">{avatar.credit_cost}</span>
                          <span className="text-sm text-muted-foreground">credits</span>
                        </div>
                        {owned ? (
                          <Badge className="bg-primary">Owned</Badge>
                        ) : isLocked ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Lock className="h-3 w-3 mr-1" />
                            Level {levelRequired}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase('avatar', avatar.id, avatar.name, avatar.credit_cost, levelRequired)}
                            disabled={purchasing === avatar.id}
                          >
                            {purchasing === avatar.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Buy'
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
