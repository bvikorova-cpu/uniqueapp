import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Crown, Star, Lock, Gift, Zap, Trophy, Sparkles, Coins, Target, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SeasonTier {
  level: number;
  xpRequired: number;
  freeReward: { label: string; icon: typeof Star; credits?: number };
  premiumReward: { label: string; icon: typeof Star; credits?: number };
}

const SEASON_TIERS: SeasonTier[] = [
  { level: 1, xpRequired: 0, freeReward: { label: '5 Credits', icon: Coins, credits: 5 }, premiumReward: { label: '15 Credits', icon: Coins, credits: 15 } },
  { level: 2, xpRequired: 100, freeReward: { label: '50/50 Power-up', icon: Target }, premiumReward: { label: '25 Credits', icon: Coins, credits: 25 } },
  { level: 3, xpRequired: 250, freeReward: { label: '10 Credits', icon: Coins, credits: 10 }, premiumReward: { label: 'Exclusive Badge', icon: Shield } },
  { level: 4, xpRequired: 500, freeReward: { label: 'Hint Power-up', icon: Zap }, premiumReward: { label: '50 Credits', icon: Coins, credits: 50 } },
  { level: 5, xpRequired: 800, freeReward: { label: '15 Credits', icon: Coins, credits: 15 }, premiumReward: { label: '2× Power-up ×3', icon: Sparkles } },
  { level: 6, xpRequired: 1200, freeReward: { label: 'Extra Time ×2', icon: Zap }, premiumReward: { label: '75 Credits', icon: Coins, credits: 75 } },
  { level: 7, xpRequired: 1700, freeReward: { label: '20 Credits', icon: Coins, credits: 20 }, premiumReward: { label: 'Legendary Badge', icon: Crown } },
  { level: 8, xpRequired: 2300, freeReward: { label: '50/50 ×3', icon: Target }, premiumReward: { label: '100 Credits', icon: Coins, credits: 100 } },
  { level: 9, xpRequired: 3000, freeReward: { label: '30 Credits', icon: Coins, credits: 30 }, premiumReward: { label: 'All Power-ups ×5', icon: Sparkles } },
  { level: 10, xpRequired: 4000, freeReward: { label: '50 Credits', icon: Coins, credits: 50 }, premiumReward: { label: '250 Credits + Crown', icon: Trophy, credits: 250 } },
];

export const SeasonPass = () => {
  const [currentXP, setCurrentXP] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [claimedLevels, setClaimedLevels] = useState<number[]>([]);
  const [seasonEnd, setSeasonEnd] = useState('');

  useEffect(() => {
    loadSeasonData();
    calculateSeasonEnd();
  }, []);

  const calculateSeasonEnd = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diff = endOfMonth.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setSeasonEnd(`${days} days left`);
  };

  const loadSeasonData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get match count as XP proxy
    const { count } = await supabase
      .from('brain_duel_matches')
      .select('*', { count: 'exact', head: true })
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq('status', 'finished');

    setCurrentXP((count || 0) * 50); // 50 XP per match played
  };

  const currentLevel = SEASON_TIERS.reduce((level, tier) => {
    if (currentXP >= tier.xpRequired) return tier.level;
    return level;
  }, 1);

  const nextTier = SEASON_TIERS.find(t => t.level === currentLevel + 1);
  const currentTier = SEASON_TIERS.find(t => t.level === currentLevel)!;
  const progressToNext = nextTier
    ? ((currentXP - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100
    : 100;

  const claimReward = (level: number, type: 'free' | 'premium') => {
    if (type === 'premium' && !isPremium) {
      toast.info('Upgrade to Premium Pass to unlock this reward!');
      return;
    }
    if (level > currentLevel) {
      toast.error('Reach this level first!');
      return;
    }
    if (claimedLevels.includes(level * (type === 'premium' ? -1 : 1))) {
      toast.info('Already claimed!');
      return;
    }
    setClaimedLevels(prev => [...prev, level * (type === 'premium' ? -1 : 1)]);
    toast.success(`🎁 Reward claimed from Level ${level}!`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Season Pass - How it works"} steps={[{ title: 'Open', desc: 'Access the Season Pass section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Season Pass.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-primary/5 to-violet-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Crown className="h-5 w-5 text-amber-400" />
            </div>
            Season Pass
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
              Season 1
            </Badge>
            <Badge variant="outline" className="text-xs">
              {seasonEnd}
            </Badge>
          </div>
        </div>
        <CardDescription>Earn XP from matches to unlock rewards along the track</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* XP Progress */}
        <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">Level {currentLevel}</p>
              <p className="text-xs text-muted-foreground">{currentXP} XP total</p>
            </div>
            {nextTier && (
              <p className="text-xs text-muted-foreground">
                {nextTier.xpRequired - currentXP} XP to Level {nextTier.level}
              </p>
            )}
          </div>
          <Progress value={progressToNext} className="h-3" />
        </div>

        {/* Premium Upgrade */}
        {!isPremium && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 cursor-pointer"
            onClick={() => {
              setIsPremium(true);
              toast.success('Premium Pass activated! (Demo mode)');
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-400">Upgrade to Premium Pass</p>
                  <p className="text-xs text-muted-foreground">Unlock premium rewards on every level</p>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                499 Credits
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Reward Track */}
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-2">
            {SEASON_TIERS.map((tier, i) => {
              const unlocked = currentLevel >= tier.level;
              const FreeIcon = tier.freeReward.icon;
              const PremiumIcon = tier.premiumReward.icon;
              const freeClaimed = claimedLevels.includes(tier.level);
              const premiumClaimed = claimedLevels.includes(tier.level * -1);

              return (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-3 transition-all ${
                    unlocked
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/30 bg-card/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Level indicator */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 ${
                      unlocked ? 'border-primary bg-primary/20 text-primary' : 'border-muted bg-muted/20 text-muted-foreground'
                    }`}>
                      {tier.level}
                    </div>

                    {/* Free reward */}
                    <div
                      className={`flex-1 rounded-lg border p-2 cursor-pointer transition-all ${
                        freeClaimed ? 'border-green-500/30 bg-green-500/10' : unlocked ? 'border-border/50 hover:border-primary/30' : 'border-border/20'
                      }`}
                      onClick={() => claimReward(tier.level, 'free')}
                    >
                      <div className="flex items-center gap-2">
                        <FreeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs">{tier.freeReward.label}</span>
                        {freeClaimed && <Badge className="text-[8px] px-1 py-0 bg-green-500/20 text-green-400 ml-auto">✓</Badge>}
                      </div>
                    </div>

                    {/* Premium reward */}
                    <div
                      className={`flex-1 rounded-lg border p-2 cursor-pointer transition-all relative ${
                        premiumClaimed
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : isPremium && unlocked
                          ? 'border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5'
                          : 'border-border/20 bg-muted/5'
                      }`}
                      onClick={() => claimReward(tier.level, 'premium')}
                    >
                      <div className="flex items-center gap-2">
                        {!isPremium && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                        <PremiumIcon className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span className="text-xs">{tier.premiumReward.label}</span>
                        {premiumClaimed && <Badge className="text-[8px] px-1 py-0 bg-amber-500/20 text-amber-400 ml-auto">✓</Badge>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
    </>
  );
};
