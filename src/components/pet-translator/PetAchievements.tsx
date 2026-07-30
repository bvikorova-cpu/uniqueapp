import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { computeStreaks } from "./PetMoodStreaks";

type Stats = {
  translations: number;
  emotions: number;
  pets: number;
  symptomChecks: number;
  favorites: number;
  posts: number;
  likesReceived: number;
  longestStreak: number;
};

const EMPTY: Stats = {
  translations: 0, emotions: 0, pets: 0, symptomChecks: 0,
  favorites: 0, posts: 0, likesReceived: 0, longestStreak: 0,
};

export default function PetAchievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [s, setS] = useState<Stats>(EMPTY);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const [tRes, pRes, symRes, postRes] = await Promise.all([
      supabase.from("pet_translations").select("emotion, is_favorite, created_at").eq("user_id", user.id).limit(2000),
      supabase.from("pet_profiles").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("pet_symptoms_log").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("pet_social_posts").select("likes_count").eq("user_id", user.id).limit(1000),
    ]);

    const rows = (tRes.data as { emotion: string | null; is_favorite: boolean | null; created_at: string }[]) || [];
    const posts = (postRes.data as { likes_count: number | null }[]) || [];

    setS({
      translations: rows.length,
      emotions: new Set(rows.map(r => (r.emotion || "").toLowerCase().trim()).filter(Boolean)).size,
      pets: pRes.count || 0,
      symptomChecks: symRes.count || 0,
      favorites: rows.filter(r => r.is_favorite).length,
      posts: posts.length,
      likesReceived: posts.reduce((a, p) => a + (p.likes_count || 0), 0),
      longestStreak: computeStreaks(rows.map(r => r.created_at)).longest,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const achievements = useMemo(() => ([
    { id: 1, title: "First Translation", desc: "Complete your first pet translation", icon: "🎤", points: 50, value: s.translations, goal: 1 },
    { id: 2, title: "Emotion Expert", desc: "Detect 10 different emotions", icon: "💜", points: 100, value: s.emotions, goal: 10 },
    { id: 3, title: "Health Guardian", desc: "Complete 5 symptom checks", icon: "🏥", points: 150, value: s.symptomChecks, goal: 5 },
    { id: 4, title: "Collector", desc: "Save 10 favourite results", icon: "⭐", points: 200, value: s.favorites, goal: 10 },
    { id: 5, title: "Storyteller", desc: "Share 5 posts in the community", icon: "🗣️", points: 100, value: s.posts, goal: 5 },
    { id: 6, title: "Pet Whisperer", desc: "100 total translations", icon: "🐾", points: 500, value: s.translations, goal: 100 },
    { id: 7, title: "Streak King", desc: "Reach a 30-day streak", icon: "🔥", points: 300, value: s.longestStreak, goal: 30 },
    { id: 8, title: "Community Star", desc: "Receive 50 likes on your posts", icon: "🌟", points: 250, value: s.likesReceived, goal: 50 },
    { id: 9, title: "Multi-Pet Owner", desc: "Add 3+ pet profiles", icon: "🐕", points: 150, value: s.pets, goal: 3 },
    { id: 10, title: "Behavior Analyst", desc: "Run 25 translations", icon: "🧠", points: 200, value: s.translations, goal: 25 },
    { id: 11, title: "Week Warrior", desc: "Reach a 7-day streak", icon: "🏆", points: 400, value: s.longestStreak, goal: 7 },
    { id: 12, title: "Legend", desc: "500 total translations", icon: "👑", points: 1000, value: s.translations, goal: 500 },
  ].map(a => ({ ...a, unlocked: a.value >= a.goal }))), [s]);

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <>
      <FloatingHowItWorks title="How Pet Achievements works" steps={[
          { title: 'Use the tools', desc: 'Translations, symptom checks, pets and posts all count towards badges.' },
          { title: 'Automatic unlocks', desc: 'Every badge is calculated live from your own real activity.' },
          { title: 'Track progress', desc: 'Locked badges show exactly how far you still are from the goal.' },
          { title: 'Earn points', desc: 'Points add up from unlocked badges only.' },
        ]} />
      <div className="mb-8">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Pet Achievements</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px]">{unlockedCount}/{achievements.length} unlocked</Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{totalPoints} Points</Badge>
        </div>
      </div>

      {!user ? (
        <Card className="bg-card/80 border-purple-500/20">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Sign in to unlock and track achievements.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map((a, i) => {
            const pct = Math.min(100, Math.round((a.value / a.goal) * 100));
            return (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className={`text-center p-3 h-full transition-all ${a.unlocked ? "border-purple-500/50 bg-purple-500/10" : "opacity-70"}`}>
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-xs font-bold mt-1 truncate">{a.title}</p>
                  <p className="text-[9px] text-muted-foreground line-clamp-2">{a.desc}</p>
                  {!a.unlocked && (
                    <>
                      <Progress value={pct} className="h-1 mt-2" />
                      <p className="text-[9px] text-muted-foreground mt-1">{Math.min(a.value, a.goal)}/{a.goal}</p>
                    </>
                  )}
                  <Badge className={`mt-1 text-[8px] ${a.unlocked ? "bg-purple-500 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {a.unlocked ? "✓ Unlocked" : `${a.points} pts`}
                  </Badge>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </>
    );
}
