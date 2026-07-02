import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Zap, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ProfileMilestonesProps {
  userId: string;
}

interface Stats {
  votes: number;
  comments: number;
  uploads: number;
  followers: number;
  joinedDays: number;
}

const LEVELS = [
  { lvl: 1, name: "Newcomer", min: 0, color: "from-slate-400 to-slate-600", icon: Star },
  { lvl: 2, name: "Explorer", min: 50, color: "from-emerald-400 to-teal-600", icon: Zap },
  { lvl: 3, name: "Creator", min: 250, color: "from-blue-400 to-purple-600", icon: Award },
  { lvl: 4, name: "Star", min: 1000, color: "from-pink-500 to-orange-500", icon: Sparkles },
  { lvl: 5, name: "Legend", min: 5000, color: "from-yellow-400 via-orange-500 to-red-500", icon: Crown },
];

export function ProfileMilestones({ userId }: ProfileMilestonesProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [realXp, setRealXp] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [votes, comments, uploads, followers, profile, points] = await Promise.all([
          (supabase as any).from("megatalent_votes").select("*", { count: "exact", head: true }).eq("user_id", userId),
          (supabase as any).from("post_comments").select("*", { count: "exact", head: true }).eq("user_id", userId),
          (supabase as any).from("megatalent_entries").select("*", { count: "exact", head: true }).eq("user_id", userId),
          (supabase as any).from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
          (supabase as any).from("profiles_public").select("created_at").eq("id", userId).maybeSingle(),
          (supabase as any).from("user_points").select("total_points").eq("user_id", userId).maybeSingle(),
        ]);
        const created = (profile.data as any)?.created_at;
        const days = created ? Math.max(1, Math.floor((Date.now() - new Date(created).getTime()) / 86400000)) : 0;
        setStats({
          votes: votes.count || 0,
          comments: comments.count || 0,
          uploads: uploads.count || 0,
          followers: followers.count || 0,
          joinedDays: days,
        });
        setRealXp((points.data as any)?.total_points ?? null);
      } catch {
        setStats({ votes: 0, comments: 0, uploads: 0, followers: 0, joinedDays: 0 });
      }
    })();
  }, [userId]);

  if (!stats) return null;

  const xp = realXp ?? (stats.votes * 2 + stats.comments * 3 + stats.uploads * 25 + stats.followers * 10);
  const currentLevel = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.min > xp);
  const progress = nextLevel
    ? Math.min(100, ((xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;
  const Icon = currentLevel.icon;

  return (
    <>
      <FloatingHowItWorks title={"Profile Milestones - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Milestones section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Milestones.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-primary" />
          Profile Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* level badge */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className={`relative h-20 w-20 rounded-2xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center shadow-xl`}
          >
            <Icon className="h-10 w-10 text-white" />
            <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-black">
              {currentLevel.lvl}
            </div>
          </motion.div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Level {currentLevel.lvl}</p>
            <p className="text-xl font-bold">{currentLevel.name}</p>
            <p className="text-xs text-muted-foreground">{xp.toLocaleString()} XP</p>
          </div>
        </div>

        {/* progress */}
        {nextLevel && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Next: {nextLevel.name}</span>
              <span className="font-semibold">{(nextLevel.min - xp).toLocaleString()} XP to go</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${nextLevel.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* stats grid */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { label: "Votes", v: stats.votes },
            { label: "Comments", v: stats.comments },
            { label: "Uploads", v: stats.uploads },
            { label: "Followers", v: stats.followers },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-lg font-bold">{s.v.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* badges row */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
          {stats.joinedDays >= 1 && <Badge variant="secondary" className="text-[10px]">Day 1</Badge>}
          {stats.joinedDays >= 30 && <Badge variant="secondary" className="text-[10px]">30 days</Badge>}
          {stats.joinedDays >= 365 && <Badge className="text-[10px] bg-gradient-to-r from-yellow-500 to-orange-500">1 year+</Badge>}
          {stats.votes >= 10 && <Badge variant="secondary" className="text-[10px]">Active Voter</Badge>}
          {stats.uploads >= 1 && <Badge variant="secondary" className="text-[10px]">Creator</Badge>}
          {stats.followers >= 10 && <Badge variant="secondary" className="text-[10px]">Rising Star</Badge>}
          {stats.followers >= 100 && <Badge className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-500">Influencer</Badge>}
        </div>
      </CardContent>
    </Card>
    </>
  );
}

export default ProfileMilestones;
