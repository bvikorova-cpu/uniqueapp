import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Swords, Trophy, Users, Flame, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const CHALLENGES = [
  { id: "pushup-100", title: "100 Push-ups Challenge", desc: "Complete 100 push-ups in one day", duration: "1 Day", icon: "💪", xp: 50 },
  { id: "plank-5min", title: "5-Minute Plank Challenge", desc: "Hold a plank for 5 minutes total", duration: "1 Day", icon: "🧘", xp: 40 },
  { id: "10k-steps-7d", title: "10K Steps for 7 Days", desc: "Walk 10,000 steps every day for a week", duration: "7 Days", icon: "🚶", xp: 100 },
  { id: "no-sugar-week", title: "No Sugar Week", desc: "Avoid added sugar for 7 days", duration: "7 Days", icon: "🍬", xp: 80 },
  { id: "cold-shower", title: "Cold Shower Warrior", desc: "Take a cold shower every morning for 5 days", duration: "5 Days", icon: "🧊", xp: 60 },
  { id: "hydration-king", title: "Hydration King", desc: "Drink 3L water daily for 7 days", duration: "7 Days", icon: "💧", xp: 70 },
];

export default function AISocialChallenges({ onBack }: Props) {
  const [joined, setJoined] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    const { data } = await supabase.from("activity_logs").select("user_id, points_earned").order("points_earned", { ascending: false }).limit(20);
    if (data) {
      const grouped: Record<string, number> = {};
      data.forEach(d => { grouped[d.user_id] = (grouped[d.user_id] || 0) + d.points_earned; });
      const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, xp], i) => ({ rank: i + 1, userId: id.slice(0, 8), xp }));
      setLeaderboard(sorted);
    }
  };

  const joinChallenge = async (challengeId: string, xp: number) => {
    if (joined.includes(challengeId)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
      await supabase.from("activity_logs").insert({ user_id: user.id, activity_type: `challenge_${challengeId}`, points_earned: xp });
      setJoined(prev => [...prev, challengeId]);
      toast({ title: "Challenge Joined! 🏆", description: `+${xp} XP when completed` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Social Challenges - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Social Challenges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Social Challenges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30">
          <Swords className="h-5 w-5 text-pink-400" />
          <span className="font-bold text-pink-400">Social Challenges</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">Free</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHALLENGES.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`p-4 transition-all duration-300 ${joined.includes(c.id) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card/80 border-border/60 hover:border-pink-500/50 hover:scale-[1.02]"}`}>
              <div className="text-3xl mb-2">{c.icon}</div>
              <h4 className="font-bold text-sm">{c.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">{c.duration}</Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 text-xs">+{c.xp} XP</Badge>
              </div>
              <Button size="sm" className={`w-full mt-3 ${joined.includes(c.id) ? "bg-emerald-600" : "bg-gradient-to-r from-pink-500 to-rose-600"} text-white`} onClick={() => joinChallenge(c.id, c.xp)} disabled={joined.includes(c.id)}>
                {joined.includes(c.id) ? "✅ Joined" : "Join Challenge"}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <h3 className="text-xl font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-400" /> Global Leaderboard</h3>
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60">
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No entries yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center justify-between p-3 rounded-lg ${entry.rank <= 3 ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-card/50"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black w-8">{entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}</span>
                  <span className="font-medium">User {entry.userId}...</span>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">{entry.xp} XP</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
    </>
  );
}
