import { motion } from "framer-motion";
import { Trophy, Star, Award, Medal, Crown, Zap, Heart, Target, Sparkles, Flame, Lock } from "lucide-react";
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
  current: number;
  goal: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const rarityStyles = {
  common: {
    ring: "ring-slate-400/40",
    glow: "shadow-[0_8px_24px_-8px_hsl(215_20%_50%/0.45)]",
    icon: "text-slate-500 dark:text-slate-300",
    bg: "from-slate-200/70 to-slate-100/40 dark:from-slate-700/40 dark:to-slate-800/30",
    bar: "from-slate-400 to-slate-500",
    label: "Common",
  },
  rare: {
    ring: "ring-sky-400/50",
    glow: "shadow-[0_10px_28px_-8px_hsl(200_90%_55%/0.5)]",
    icon: "text-sky-500 dark:text-sky-300",
    bg: "from-sky-200/70 to-sky-100/30 dark:from-sky-900/50 dark:to-sky-950/40",
    bar: "from-sky-400 to-cyan-400",
    label: "Rare",
  },
  epic: {
    ring: "ring-violet-400/60",
    glow: "shadow-[0_12px_32px_-8px_hsl(270_91%_60%/0.55)]",
    icon: "text-violet-500 dark:text-violet-300",
    bg: "from-violet-200/70 to-fuchsia-100/30 dark:from-violet-900/50 dark:to-fuchsia-950/40",
    bar: "from-violet-500 to-fuchsia-500",
    label: "Epic",
  },
  legendary: {
    ring: "ring-amber-400/70",
    glow: "shadow-[0_14px_36px_-8px_hsl(38_95%_55%/0.6)]",
    icon: "text-amber-500 dark:text-amber-300",
    bg: "from-amber-200/80 to-orange-100/40 dark:from-amber-900/50 dark:to-orange-950/40",
    bar: "from-amber-400 to-orange-500",
    label: "Legendary",
  },
} as const;

/** Trophy Wall — real, per-user achievement progress with rarity-tiered visuals. */
export const AchievementsWall = ({ userId, stats }: AchievementsWallProps) => {
  // Self-contained real counters so the wall is accurate for every profile,
  // even before the parent's deferred stats pass finishes loading.
  const { data: live } = useQuery({
    queryKey: ["trophy-wall-stats", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const count = async (
        table: string,
        column: string,
        selectCol = "id",
      ): Promise<number> => {
        const { count: c } = await supabase
          .from(table as never)
          .select(selectCol, { count: "exact", head: true })
          .eq(column, userId);
        return c ?? 0;
      };

      const [posts, likes, comments, contests, courses, followers] = await Promise.all([
        count("posts", "user_id"),
        count("post_likes", "user_id", "*"),
        count("post_comments", "user_id", "*"),
        count("talent_submissions", "user_id", "*"),
        count("completed_courses", "user_id", "*"),
        count("user_follows", "following_id"),
      ]);

      return { posts, likes, comments, contests, courses, followers };
    },
  });

  const s = {
    posts: Math.max(stats.posts ?? 0, live?.posts ?? 0),
    likes: Math.max(stats.likes ?? 0, live?.likes ?? 0),
    comments: Math.max(stats.comments ?? 0, live?.comments ?? 0),
    contests: Math.max(stats.contests ?? 0, live?.contests ?? 0),
    courses: Math.max(stats.courses ?? 0, live?.courses ?? 0),
    followers: Math.max(stats.followers ?? 0, live?.followers ?? 0),
  };

  const achievements: Achievement[] = [
    { id: "first-post", icon: Sparkles, label: "First Post", description: "Publish your first post", current: s.posts, goal: 1, rarity: "common" },
    { id: "scholar", icon: Star, label: "Scholar", description: "Complete your first course", current: s.courses, goal: 1, rarity: "common" },
    { id: "contender", icon: Target, label: "Contender", description: "Join a contest", current: s.contests, goal: 1, rarity: "rare" },
    { id: "social-10", icon: Heart, label: "Social Butterfly", description: "Reach 10 followers", current: s.followers, goal: 10, rarity: "rare" },
    { id: "popular", icon: Flame, label: "Trending", description: "Give 50 likes", current: s.likes, goal: 50, rarity: "rare" },
    { id: "voice", icon: Zap, label: "Voice", description: "Write 25 comments", current: s.comments, goal: 25, rarity: "rare" },
    { id: "creator", icon: Award, label: "Creator", description: "Publish 10 posts", current: s.posts, goal: 10, rarity: "epic" },
    { id: "champion", icon: Medal, label: "Champion", description: "Enter 3 contests", current: s.contests, goal: 3, rarity: "epic" },
    { id: "scholar-elite", icon: Trophy, label: "Master Scholar", description: "Complete 5 courses", current: s.courses, goal: 5, rarity: "epic" },
    { id: "legend", icon: Crown, label: "Legend", description: "Reach 1000 followers", current: s.followers, goal: 1000, rarity: "legendary" },
  ];

  const unlockedCount = achievements.filter((a) => a.current >= a.goal).length;
  const completion = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <>
      <FloatingHowItWorks
        title={"Trophy Wall - How it works"}
        steps={[
          { title: "Earn", desc: "Trophies unlock automatically from your real activity — posts, likes, comments, contests, courses and followers." },
          { title: "Track", desc: "Each locked trophy shows a live progress bar with your current count and the goal." },
          { title: "Rarity", desc: "Trophies are tiered Common, Rare, Epic and Legendary — higher tiers need much more activity." },
          { title: "Complete", desc: "The header shows how many trophies you hold and your overall completion." },
        ]}
      />

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-card/90 via-card/60 to-card/30 p-5 sm:p-7 backdrop-blur-xl shadow-[0_18px_50px_-24px_hsl(38_95%_50%/0.35)]">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <Trophy className="h-5 w-5 text-white" />
              <motion.div
                className="absolute inset-0 rounded-xl ring-2 ring-amber-300/50"
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Trophy Wall
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {unlockedCount} of {achievements.length} unlocked · {completion}% complete
              </p>
            </div>
          </div>

          <div className="min-w-[140px] flex-1 sm:max-w-[220px]">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {achievements.map((a, i) => {
            const Icon = a.icon;
            const style = rarityStyles[a.rarity];
            const unlocked = a.current >= a.goal;
            const pct = Math.min(100, Math.round((a.current / a.goal) * 100));

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.04, y: -3 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} p-3 ring-1 ${style.ring} ${
                  unlocked ? style.glow : "opacity-80"
                } transition-all`}
                title={`${a.label}: ${a.description}`}
              >
                {/* shine sweep on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative flex items-start justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-background/60 backdrop-blur ${
                      unlocked ? style.icon : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {unlocked ? (
                    <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-foreground/80">
                      {style.label}
                    </span>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/70" />
                  )}
                </div>

                <p className={`relative mt-2 text-[11px] font-bold leading-tight ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {a.label}
                </p>
                <p className="relative text-[9px] leading-tight text-muted-foreground/80">{a.description}</p>

                <div className="relative mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.03 }}
                    />
                  </div>
                  <p className="mt-1 text-[9px] font-semibold text-muted-foreground">
                    {Math.min(a.current, a.goal)} / {a.goal}
                  </p>
                </div>

                {unlocked && a.rarity === "legendary" && (
                  <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-amber-400 shadow-[0_0_12px_hsl(38_95%_55%)]" />
                )}
              </motion.div>
            );
          })}
        </div>

        {unlockedCount < achievements.length && (
          <p className="relative mt-4 text-center text-[11px] text-muted-foreground/80">
            Keep going — post, comment, follow and learn to unlock the rest.
          </p>
        )}
      </div>
    </>
  );
};
