import { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import {
  Sparkles, Zap, Star, Crown, Gift, Palette, Image as ImageIcon,
  Award, Loader2, Lock, Eye, Rocket, ArrowLeft, Trophy, Flame, Package
} from "lucide-react";
import { PremiumStoreHero } from "@/components/store/PremiumStoreHero";
import { LiveActivityTicker } from "@/components/store/LiveActivityTicker";
import { FlashSaleCard } from "@/components/store/FlashSaleCard";
import { BundlePack } from "@/components/store/BundlePack";
import { StoreLeaderboard } from "@/components/store/StoreLeaderboard";
import { LimitedEditionBanner } from "@/components/store/LimitedEditionBanner";
import { WishlistButton } from "@/components/store/WishlistButton";
import { GiftDialog } from "@/components/store/GiftDialog";
import { ConfettiBurst } from "@/components/store/ConfettiBurst";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const LEVEL_REQUIREMENTS: Record<string, number> = {
  'visibility_boost': 5,
  'featured_listing': 10,
  'employer_branding': 15,
  'premium_analytics': 20,
  'common': 1,
  'rare': 10,
  'legendary': 20,
  'basic_theme': 5,
  'premium_theme': 15,
  'basic_avatar': 5,
  'animated_avatar': 20,
};

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
    features, badges, themes, avatars,
    userBadges, userThemes, userAvatars,
    purchaseFeature, purchaseBadge, purchaseTheme, purchaseAvatar,
    activateTheme, loading
  } = usePremiumStore();

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [giftItem, setGiftItem] = useState<{ type: string; id: string; name: string; emoji?: string; cost: number } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("visibility");

  useEffect(() => {
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
  }, []);

  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id));
  }, []);

  const getLevelRequirement = (type: string, rarity?: string): number => {
    if (type === 'visibility') return LEVEL_REQUIREMENTS['visibility_boost'] || 5;
    if (rarity) return LEVEL_REQUIREMENTS[rarity] || 1;
    return LEVEL_REQUIREMENTS[type] || 1;
  };

  const canPurchase = (levelRequired: number): boolean => userLevel >= levelRequired;

  const handlePurchase = async (
    type: 'feature' | 'badge' | 'theme' | 'avatar' | 'visibility',
    id: string, name: string, cost: number, levelRequired: number = 1
  ) => {
    if (!canPurchase(levelRequired)) {
      toast({ title: "Level Required", description: `Reach Level ${levelRequired} to unlock.`, variant: "destructive" });
      return;
    }
    if (credits.credits_remaining < cost) {
      toast({ title: "Not enough credits", description: `You need ${cost} credits. You have ${credits.credits_remaining}.`, variant: "destructive" });
      return;
    }
    setPurchasing(id);
    try {
      let success = false;
      switch (type) {
        case 'feature': case 'visibility': success = await purchaseFeature(id, name, cost); break;
        case 'badge': success = await purchaseBadge(id, cost); break;
        case 'theme': success = await purchaseTheme(id, cost); break;
        case 'avatar': success = await purchaseAvatar(id, cost); break;
      }
      if (success) {
        toast({ title: "🎉 Purchase successful!", description: `You've unlocked ${name}` });
        setConfettiTrigger((t) => t + 1);
        // Log to leaderboard
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('premium_store_purchases').insert({
            user_id: user.id, item_type: type, item_id: id, item_name: name, credits_spent: cost, is_gift: false,
          });
        }
      } else {
        throw new Error("Purchase failed");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({ title: "Purchase failed", description: "Please try again", variant: "destructive" });
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
      <>
        <FloatingHowItWorks title="How Premium Store works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
        <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/rewards')} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Rewards
          </Button>
        </motion.div>

        {/* Cinematic vault hero */}
        <PremiumStoreHero
          credits={credits.credits_remaining}
          level={userLevel}
          onBuyCredits={() => navigate('/ai-credits')}
        />

        {/* Live activity ticker */}
        <LiveActivityTicker />

        {/* Limited Edition banner - auto-refreshing seasonal drop */}
        {(() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth(); // 0-11
          const seasons = [
            { name: 'Winter', emoji: '❄️', endMonth: 1, endDay: 28 }, // Dec-Feb
            { name: 'Spring', emoji: '🌸', endMonth: 4, endDay: 31 }, // Mar-May
            { name: 'Summer', emoji: '🔥', endMonth: 7, endDay: 31 }, // Jun-Aug
            { name: 'Autumn', emoji: '🍂', endMonth: 10, endDay: 30 }, // Sep-Nov
          ];
          const seasonIdx = month <= 1 ? 0 : month <= 4 ? 1 : month <= 7 ? 2 : month <= 10 ? 3 : 0;
          const season = seasons[seasonIdx];
          const endYear = seasonIdx === 0 && month === 11 ? year + 1 : year;
          const endDate = new Date(endYear, season.endMonth, season.endDay);
          const endsAt = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          // Simulate scarcity that decreases as season progresses
          const totalSupply = 500;
          const seasonStart = new Date(endYear, season.endMonth - 2, 1);
          const seasonMs = endDate.getTime() - seasonStart.getTime();
          const elapsed = Math.max(0, Math.min(seasonMs, now.getTime() - seasonStart.getTime()));
          const sold = Math.round((elapsed / seasonMs) * (totalSupply - 40)) + 40;
          const remaining = Math.max(12, totalSupply - sold);
          return (
            <div className="mb-6">
              <LimitedEditionBanner
                title={`${season.name} ${year} Mythic Drop`}
                subtitle="Hand-crafted animated avatars & legendary frames. Once they're gone, they're gone."
                emoji={season.emoji}
                totalSupply={totalSupply}
                remaining={remaining}
                endsAt={endsAt}
                onView={() => {
                  setActiveTab("avatars");
                  setTimeout(() => {
                    document.getElementById('store-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
              />
            </div>
          );
        })()}


        {/* Daily Flash Sale + Bundles row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-1">
            <FlashSaleCard
              name="Mega Visibility Pack"
              description="3× 24h boost + 1× 7-day featured"
              emoji="🔥"
              originalPrice={80}
              discountPercent={40}
              onBuy={() => handlePurchase('visibility', 'flash_mega', 'Mega Visibility Pack', 48, 5)}
              disabled={purchasing === 'flash_mega'}
            />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BundlePack
              tier="starter"
              name="Starter Kit"
              description="Perfect first taste of premium"
              items={[
                { emoji: '🚀', name: '24h Visibility Boost' },
                { emoji: '🎨', name: 'Basic Theme' },
                { emoji: '⭐', name: 'Common Badge' },
              ]}
              originalPrice={40}
              bundlePrice={28}
              onBuy={() => handlePurchase('feature', 'bundle_starter', 'Starter Kit', 28)}
              disabled={purchasing === 'bundle_starter'}
            />
            <BundlePack
              tier="pro"
              name="Pro Bundle"
              description="Everything a power user needs"
              popular
              items={[
                { emoji: '⭐', name: '7-Day Featured' },
                { emoji: '🎨', name: 'Premium Theme' },
                { emoji: '👑', name: 'Rare Badge' },
                { emoji: '🧙', name: 'Animated Avatar' },
              ]}
              originalPrice={250}
              bundlePrice={169}
              onBuy={() => handlePurchase('feature', 'bundle_pro', 'Pro Bundle', 169, 10)}
              disabled={purchasing === 'bundle_pro'}
            />
            <BundlePack
              tier="legendary"
              name="Legendary Vault"
              description="The ultimate collector's bundle"
              items={[
                { emoji: '💎', name: '30-day Spotlight' },
                { emoji: '👑', name: 'Legendary Badge' },
                { emoji: '🐉', name: 'Mythic Avatar' },
                { emoji: '🎨', name: 'All Themes' },
                { emoji: '🏆', name: 'Top Frame' },
              ]}
              originalPrice={600}
              bundlePrice={399}
              onBuy={() => handlePurchase('feature', 'bundle_legendary', 'Legendary Vault', 399, 20)}
              disabled={purchasing === 'bundle_legendary'}
            />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <StoreLeaderboard currentUserId={currentUserId} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="store-tabs">
          <TabsList className="grid w-full grid-cols-5 h-auto backdrop-blur-xl bg-card/60 border border-border/50">
            <TabsTrigger value="visibility" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> Visibility
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" /> Features
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" /> Badges
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" /> Themes
            </TabsTrigger>
            <TabsTrigger value="avatars" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5">
              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" /> Avatars
            </TabsTrigger>
          </TabsList>

          {/* VISIBILITY BOOSTERS */}
          <TabsContent value="visibility">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-5 w-5 text-green-500" />
                  <h3 className="font-bold text-lg">Visibility Boosters</h3>
                  <Badge className="bg-green-500 text-white">Top Revenue</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Increase your listing exposure. Higher visibility = more responses = more success!
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {VISIBILITY_BOOSTERS.map((boost, i) => {
                  const isLocked = userLevel < boost.levelRequired;
                  const levelProgress = Math.min(100, (userLevel / boost.levelRequired) * 100);
                  
                  return (
                    <motion.div
                      key={boost.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className={`overflow-hidden backdrop-blur-xl h-full transition-all hover:shadow-lg ${
                        isLocked 
                          ? 'bg-muted/30 border-muted opacity-75' 
                          : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40'
                      }`}>
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
                            <Badge className="bg-green-500 text-white shrink-0">{boost.multiplier} Views</Badge>
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
                              <p className="text-xs text-muted-foreground">Reach Level {boost.levelRequired} to unlock</p>
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
                              {purchasing === boost.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isLocked ? <><Lock className="h-4 w-4 mr-1" /> Locked</> : 'Boost Now'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          {/* Premium Features */}
          <TabsContent value="features">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div key={feature.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="backdrop-blur-xl bg-card/80 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{feature.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{feature.feature_name}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
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
                        <Button size="sm" onClick={() => handlePurchase('feature', feature.id, feature.feature_name, feature.credit_cost)} disabled={purchasing === feature.id}>
                          {purchasing === feature.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Badge levels: <strong>Common (Lvl 1)</strong> • <strong>Rare (Lvl 10)</strong> • <strong>Legendary (Lvl 20)</strong></span>
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge, i) => {
                const owned = userBadges.some(ub => ub.badge_id === badge.id);
                const levelRequired = getLevelRequirement('badge', badge.rarity);
                const isLocked = userLevel < levelRequired;
                
                return (
                  <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                    <Card className={`overflow-hidden backdrop-blur-xl transition-all hover:shadow-lg ${owned ? 'ring-2 ring-primary bg-primary/5' : ''} ${isLocked ? 'opacity-75' : 'hover:border-primary/30'}`}>
                      <div className={`h-2 ${getRarityGradient(badge.rarity)}`} />
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-5xl">{badge.icon}</div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getRarityBadge(badge.rarity)}>{badge.rarity.toUpperCase()}</Badge>
                            {isLocked && <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" /> Lvl {levelRequired}</Badge>}
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
                            <Badge variant="outline" className="text-muted-foreground"><Lock className="h-3 w-3 mr-1" /> Level {levelRequired}</Badge>
                          ) : (
                            <Button size="sm" onClick={() => handlePurchase('badge', badge.id, badge.name, badge.credit_cost, levelRequired)} disabled={purchasing === badge.id}>
                              {purchasing === badge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Themes */}
          <TabsContent value="themes">
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
                  <motion.div key={theme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                    <Card className={`backdrop-blur-xl transition-all hover:shadow-lg ${isActive ? 'ring-2 ring-primary' : owned ? 'ring-1 ring-muted' : 'hover:border-primary/30'}`}>
                      <CardHeader>
                        <div className="mb-3">
                          <div className={`h-32 rounded-xl bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-gray-900">Theme Preview</div>
                            </div>
                            {isActive && <div className="absolute top-2 right-2"><Badge className="bg-primary">Active</Badge></div>}
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
                            isActive ? <Badge variant="secondary">Active</Badge> : (
                              <Button size="sm" variant="outline" onClick={() => activateTheme(theme.id)}>Activate</Button>
                            )
                          ) : (
                            <Button size="sm" onClick={() => handlePurchase('theme', theme.id, theme.name, theme.credit_cost)} disabled={purchasing === theme.id}>
                              {purchasing === theme.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Avatars */}
          <TabsContent value="avatars">
            <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Avatars: <strong>Basic (Lvl 5)</strong> • <strong>Animated (Lvl 20)</strong></span>
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {avatars.map((avatar, i) => {
                const owned = userAvatars.some(ua => ua.avatar_id === avatar.id);
                const levelRequired = avatar.is_animated ? 20 : getLevelRequirement('avatar', avatar.rarity);
                const isLocked = userLevel < levelRequired;
                
                return (
                  <motion.div key={avatar.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                    <Card className={`overflow-hidden backdrop-blur-xl transition-all hover:shadow-lg ${owned ? 'ring-2 ring-primary' : ''} ${isLocked ? 'opacity-75' : 'hover:border-primary/30'}`}>
                      <div className={`h-2 ${getRarityGradient(avatar.rarity)}`} />
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-20 h-20 rounded-full ${getRarityGradient(avatar.rarity)} flex items-center justify-center ${avatar.is_animated ? 'animate-pulse' : ''}`}>
                            <Sparkles className="h-10 w-10 text-white" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getRarityBadge(avatar.rarity)}>{avatar.rarity.toUpperCase()}</Badge>
                            {avatar.is_animated && <Badge variant="outline" className="text-xs">ANIMATED</Badge>}
                            {isLocked && <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" /> Lvl {levelRequired}</Badge>}
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
                            <Badge variant="outline" className="text-muted-foreground"><Lock className="h-3 w-3 mr-1" /> Level {levelRequired}</Badge>
                          ) : (
                            <Button size="sm" onClick={() => handlePurchase('avatar', avatar.id, avatar.name, avatar.credit_cost, levelRequired)} disabled={purchasing === avatar.id}>
                              {purchasing === avatar.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confetti on purchase */}
      <ConfettiBurst trigger={confettiTrigger} />

      {/* Gift dialog */}
      {giftItem && (
        <GiftDialog
          open={!!giftItem}
          onOpenChange={(v) => !v && setGiftItem(null)}
          itemType={giftItem.type}
          itemId={giftItem.id}
          itemName={giftItem.name}
          itemEmoji={giftItem.emoji}
          creditCost={giftItem.cost}
          userCredits={credits.credits_remaining}
          onSent={() => setConfettiTrigger((t) => t + 1)}
        />
      )}
    </div>
  );
};

export default PremiumStore;
