import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Gift, Star, Crown, Trophy, Heart, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const streakRewards = [
  { day: 3, reward: "+2 Bonus Credits", icon: Gift },
  { day: 7, reward: "+5 Credits + Badge", icon: Star },
  { day: 14, reward: "+10 Credits", icon: Heart },
  { day: 30, reward: "+25 Credits + Title", icon: Crown },
  { day: 60, reward: "+50 Credits", icon: Trophy },
  { day: 100, reward: "Pet Whisperer Status", icon: Flame },
];

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function computeStreaks(dates: string[]) {
  const days = new Set(dates.map(d => dayKey(new Date(d))));
  if (days.size === 0) return { current: 0, longest: 0, activeDays: 0 };

  // current streak: walk back from today (or yesterday if today has no activity)
  let current = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // longest streak
  const sorted = [...days].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  return { current, longest, activeDays: days.size };
}

export default function PetMoodStreaks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const since = new Date(Date.now() - 365 * 86400000).toISOString();
    const { data } = await supabase
      .from("pet_translations")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(2000);
    setDates(((data as { created_at: string }[]) || []).map(r => r.created_at));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const { current, longest, activeDays } = useMemo(() => computeStreaks(dates), [dates]);

  return (
    <>
      <FloatingHowItWorks title="How Pet Mood Streaks works" steps={[
          { title: 'Check a mood daily', desc: 'Any translation or analysis counts as a check for that day.' },
          { title: 'Keep the chain', desc: 'Your current streak counts consecutive days with at least one check.' },
          { title: 'Unlock milestones', desc: 'Milestones unlock automatically once your streak reaches the day count.' },
          { title: 'Track records', desc: 'Longest streak and total active days come from your real history.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🔥 Pet Mood Streaks</h2>
      <Card className="bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
        <CardContent className="p-4 sm:p-6">
          {!user ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sign in to track your streak.</p>
          ) : loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-primary-foreground">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">{current} {current === 1 ? "Day" : "Days"}</p>
                  <p className="text-xs text-muted-foreground">Current mood check streak</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Badge variant="outline" className="text-[10px]">Longest: {longest}</Badge>
                  <Badge variant="outline" className="text-[10px]">Active days: {activeDays}</Badge>
                </div>
              </div>
              {current === 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  No check today yet — run a translation or analysis to start your streak.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {streakRewards.map((sr, i) => {
                  const achieved = longest >= sr.day;
                  return (
                    <motion.div key={sr.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className={`text-center p-3 transition-all ${achieved ? "border-purple-500/50 bg-purple-500/10" : "opacity-50"}`}>
                        <sr.icon className={`h-5 w-5 mx-auto mb-1 ${achieved ? "text-purple-500" : "text-muted-foreground"}`} />
                        <p className="text-xs font-bold">Day {sr.day}</p>
                        <p className="text-[9px] text-muted-foreground">{sr.reward}</p>
                        {achieved
                          ? <Badge className="mt-1 text-[8px] bg-purple-500 text-primary-foreground">✓ Earned</Badge>
                          : <Badge variant="outline" className="mt-1 text-[8px]">{Math.max(0, sr.day - current)} to go</Badge>}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
