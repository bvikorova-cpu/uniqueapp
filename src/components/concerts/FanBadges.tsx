import { useState, useEffect } from "react";
import { ArrowLeft, Award, Star, Zap, TrendingUp, Crown, Heart, Music, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const LEVELS = [
  { level: 1, title: "Newcomer", xpRequired: 0, icon: "🎵", color: "text-gray-400" },
  { level: 5, title: "Regular", xpRequired: 500, icon: "🎶", color: "text-blue-400" },
  { level: 10, title: "Superfan", xpRequired: 1500, icon: "⭐", color: "text-amber-400" },
  { level: 20, title: "Groupie", xpRequired: 5000, icon: "🔥", color: "text-orange-500" },
  { level: 30, title: "VIP Fan", xpRequired: 12000, icon: "💎", color: "text-violet-400" },
  { level: 50, title: "Legend", xpRequired: 30000, icon: "👑", color: "text-amber-500" },
  { level: 75, title: "Icon", xpRequired: 60000, icon: "🌟", color: "text-pink-400" },
  { level: 100, title: "Immortal", xpRequired: 100000, icon: "🏆", color: "text-yellow-400" },
];

const BADGES = [
  { id: "first_concert", name: "First Concert", description: "Attended your first live show", icon: "🎤", earned: true, xp: 50 },
  { id: "gift_giver", name: "Gift Giver", description: "Sent 10+ virtual gifts", icon: "🎁", earned: true, xp: 100 },
  { id: "chat_star", name: "Chat Star", description: "Sent 100+ chat messages", icon: "💬", earned: true, xp: 75 },
  { id: "vip_member", name: "VIP Member", description: "Purchased VIP experience", icon: "👑", earned: false, xp: 200 },
  { id: "concert_streak", name: "3-Day Streak", description: "Attended 3 concerts in a row", icon: "🔥", earned: false, xp: 150 },
  { id: "top_voter", name: "Top Voter", description: "Voted in 20+ setlist polls", icon: "🗳️", earned: false, xp: 100 },
  { id: "merch_collector", name: "Merch Collector", description: "Bought 5+ merch items", icon: "🛍️", earned: false, xp: 125 },
  { id: "song_requester", name: "DJ Mode", description: "Made 10+ song requests", icon: "🎧", earned: false, xp: 100 },
  { id: "social_butterfly", name: "Social Butterfly", description: "Connected with 50+ fans", icon: "🦋", earned: false, xp: 150 },
  { id: "early_bird", name: "Early Bird", description: "Joined 10 concerts before start", icon: "🐦", earned: false, xp: 75 },
  { id: "night_owl", name: "Night Owl", description: "Watched a concert past midnight", icon: "🦉", earned: false, xp: 50 },
  { id: "diamond_hands", name: "Diamond Hands", description: "Sent a Diamond gift (€25)", icon: "💎", earned: false, xp: 250 },
];

const XP_ACTIVITIES = [
  { activity: "Watch a concert", xp: 25, icon: "🎵" },
  { activity: "Send a gift", xp: 10, icon: "🎁" },
  { activity: "Chat message", xp: 2, icon: "💬" },
  { activity: "Vote on setlist", xp: 5, icon: "🗳️" },
  { activity: "Song request", xp: 15, icon: "🎧" },
  { activity: "Buy merch", xp: 20, icon: "🛍️" },
  { activity: "Invite a friend", xp: 50, icon: "👥" },
  { activity: "Write a review", xp: 30, icon: "✍️" },
];

export const FanBadges = ({ onBack }: Props) => {
  const [currentXP] = useState(1850);
  const [currentLevel] = useState(12);
  const earnedBadges = BADGES.filter(b => b.earned).length;

  const currentLevelData = LEVELS.reduce((prev, curr) => currentXP >= curr.xpRequired ? curr : prev, LEVELS[0]);
  const nextLevelData = LEVELS.find(l => l.xpRequired > currentXP) || LEVELS[LEVELS.length - 1];
  const progressToNext = ((currentXP - currentLevelData.xpRequired) / (nextLevelData.xpRequired - currentLevelData.xpRequired)) * 100;

  return (
    <>
      <FloatingHowItWorks title="How Fan Badges works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Fan Badges & Levels
          </h2>
          <p className="text-sm text-muted-foreground">Earn XP, unlock badges, level up</p>
        </div>
      </div>

      {/* Level Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <span className="text-3xl">{currentLevelData.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Level</span>
                <span className="text-3xl font-black text-primary">{currentLevel}</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">{currentLevelData.title}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentXP.toLocaleString()} XP total</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentLevelData.title}</span>
              <span>{nextLevelData.title} ({nextLevelData.xpRequired.toLocaleString()} XP)</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {(nextLevelData.xpRequired - currentXP).toLocaleString()} XP to next milestone
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Award, label: "Badges", value: `${earnedBadges}/${BADGES.length}`, color: "text-amber-500" },
          { icon: Zap, label: "Total XP", value: currentXP.toLocaleString(), color: "text-primary" },
          { icon: TrendingUp, label: "Rank", value: "#247", color: "text-emerald-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges Grid */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> All Badges ({earnedBadges}/{BADGES.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BADGES.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-xl border p-3 text-center transition-all ${
                  badge.earned
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                    : "border-border opacity-50 grayscale"
                }`}
              >
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <p className="font-bold text-xs">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">+{badge.xp} XP</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* XP Activities */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> How to Earn XP</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {XP_ACTIVITIES.map((act, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-lg">{act.icon}</span>
                <div>
                  <p className="text-xs font-medium">{act.activity}</p>
                  <p className="text-xs text-primary font-bold">+{act.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Roadmap */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /> Level Roadmap</h3>
          <div className="space-y-2">
            {LEVELS.map((lvl, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                currentXP >= lvl.xpRequired ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
              }`}>
                <span className="text-xl">{lvl.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">Level {lvl.level} — {lvl.title}</p>
                  <p className="text-xs text-muted-foreground">{lvl.xpRequired.toLocaleString()} XP required</p>
                </div>
                {currentXP >= lvl.xpRequired && <Badge className="bg-emerald-500/20 text-emerald-500 border-0">✓ Reached</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
