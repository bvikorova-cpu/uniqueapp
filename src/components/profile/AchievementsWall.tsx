import { motion } from "framer-motion";
import { Trophy, Star, Award, Medal, Crown, Zap, Heart, Target, Sparkles, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AchievementsWallProps {
  userId: string;
  stats: {
    posts: number;
    friends: number;
    contests: number;
    courses: number;
    likes: number;
    comments: number;
    followers: number;
  };
}

interface Achievement {
  id: string;
  icon: typeof Trophy;
  label: string;
  description: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const rarityStyles = {
  common:    { ring: "ring-slate-400/40",  glow: "shadow-slate-500/20",  text: "text-slate-300",  bg: "from-slate-700/30 to-slate-800/30" },
  rare:      { ring: "ring-blue-400/50",   glow: "shadow-blue-500/30",   text: "text-blue-300",   bg: "from-blue-900/40 to-blue-950/40" },
  epic:      { ring: "ring-violet-400/60", glow: "shadow-violet-500/40", text: "text-violet-300", bg: "from-violet-900/40 to-violet-950/40" },
  legendary: { ring: "ring-amber-400/70",  glow: "shadow-amber-500/50",  text: "text-amber-300",  bg: "from-amber-900/40 to-amber-950/40" },
};

export const AchievementsWall = ({ userId, stats }: AchievementsWallProps) => {
  // Fetch unlocked achievements from DB
  const { data: dbAchievements } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);
      return data?.map((a) => a.achievement_id) || [];
    },
    enabled: !!userId,
  });

  // Local computed achievements based on stats (visible regardless of DB state)
  const achievements: Achievement[] = [
    { id: "first-post",   icon: Sparkles, label: "First Post",     description: "Published your first post",     unlocked: stats.posts >= 1,     rarity: "common" },
    { id: "social-10",    icon: Heart,    label: "Social Butterfly", description: "Earned 10+ followers",        unlocked: stats.followers >= 10, rarity: "rare" },
    { id: "scholar",      icon: Star,     label: "Scholar",         description: "Completed first course",       unlocked: stats.courses >= 1,    rarity: "common" },
    { id: "contender",    icon: Target,   label: "Contender",       description: "Joined 1+ contest",            unlocked: stats.contests >= 1,   rarity: "rare" },
    { id: "popular",      icon: Flame,    label: "Trending",        description: "Gave 50+ likes",               unlocked: stats.likes >= 50,     rarity: "rare" },
    { id: "voice",        icon: Zap,      label: "Voice",           description: "Wrote 25+ comments",           unlocked: stats.comments >= 25,  rarity: "rare" },
    { id: "creator",      icon: Award,    label: "Creator",         description: "Published 10+ posts",          unlocked: stats.posts >= 10,     rarity: "epic" },
    { id: "champion",     icon: Medal,    label: "Champion",        description: "Won a contest",                unlocked: stats.contests >= 3,   rarity: "epic" },
    { id: "scholar-elite",icon: Trophy,   label: "Master Scholar",  description: "Completed 5+ courses",         unlocked: stats.courses >= 5,    rarity: "epic" },
    { id: "legend",       icon: Crown,    label: "Legend",          description: "1000+ followers",              unlocked: stats.followers >= 1000, rarity: "legendary" },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  void dbAchievements; // available for future expansion

  return (
    <>
      <FloatingHowItWorks title={"Achievements Wall - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievements Wall section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievements Wall.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="glass-post-card p-5 sm:p-7 mb-6 border border-amber-400/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/30 blur-md rounded-full" />
            <Trophy className="relative h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Trophy Wall
          </h2>
        </div>
        <span className="text-xs font-bold text-amber-300/90 bg-amber-500/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
          {unlockedCount} / {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {achievements.map((a, i) => {
          const Icon = a.icon;
          const style = rarityStyles[a.rarity];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-center bg-gradient-to-br ${style.bg} ring-1 ${style.ring} ${
                a.unlocked ? `shadow-lg ${style.glow}` : "opacity-40 grayscale"
              } transition-all cursor-default`}
              title={`${a.label}: ${a.description}`}
            >
              {a.unlocked && a.rarity === "legendary" && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              )}
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${a.unlocked ? style.text : "text-muted-foreground"}`} />
              <span className={`text-[9px] sm:text-[10px] font-bold mt-1 leading-tight ${a.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {a.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {unlockedCount < achievements.length && (
        <p className="text-[11px] text-muted-foreground/80 mt-4 text-center">
          Unlock more by being active — post, comment, follow, learn.
        </p>
      )}
    </div>
    </>
  );
};
