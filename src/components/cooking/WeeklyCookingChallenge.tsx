import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Flame, Medal, Star, Users, ChefHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  participants: number;
}

interface Props { onBack: () => void; }

const WEEKLY_CHALLENGES: Challenge[] = [
  { id: 'wc1', title: '5-Ingredient Masterpiece', description: 'Create a delicious dish using only 5 ingredients. Creativity counts!', xp: 100, difficulty: 'Easy', category: 'Creativity', participants: 234 },
  { id: 'wc2', title: 'Around the World in One Dish', description: 'Combine techniques from 3 different cuisines into one harmonious dish.', xp: 250, difficulty: 'Hard', category: 'Fusion', participants: 87 },
  { id: 'wc3', title: 'Zero-Waste Kitchen', description: 'Cook a full meal using parts that are normally thrown away (stems, peels, etc.).', xp: 200, difficulty: 'Medium', category: 'Sustainability', participants: 156 },
  { id: 'wc4', title: 'Speed Chef: 15 Minutes', description: 'Prepare a restaurant-quality dish in under 15 minutes. Timer starts when you touch ingredients!', xp: 150, difficulty: 'Medium', category: 'Speed', participants: 312 },
  { id: 'wc5', title: 'Dessert Without Sugar', description: 'Create a dessert using only natural sweeteners — fruit, honey, dates, or maple syrup.', xp: 200, difficulty: 'Medium', category: 'Health', participants: 198 },
];

const LEADERBOARD = [
  { rank: 1, name: 'ChefMaster99', xp: 4520, badge: '🥇' },
  { rank: 2, name: 'CookingNinja', xp: 3890, badge: '🥈' },
  { rank: 3, name: 'SpiceQueen', xp: 3650, badge: '🥉' },
  { rank: 4, name: 'PastaKing', xp: 3200, badge: '🏅' },
  { rank: 5, name: 'BakeItTillYouMakeIt', xp: 2980, badge: '🏅' },
];

export default function WeeklyCookingChallenge({ onBack }: Props) {
  const [userXp, setUserXp] = useState(0);
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());
  const [joining, setJoining] = useState<string | null>(null);

  const level = Math.floor(userXp / 500) + 1;
  const xpInLevel = userXp % 500;
  const xpToNext = 500;

  const joinChallenge = async (challenge: Challenge) => {
    setJoining(challenge.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
      await supabase.from('activity_feed').insert({
        user_id: user.id,
        activity_type: 'cooking_challenge_joined',
        metadata: { challenge_id: challenge.id, title: challenge.title, xp: challenge.xp },
      });
      setJoinedChallenges(prev => new Set([...prev, challenge.id]));
      setUserXp(prev => prev + challenge.xp);
      toast({ title: `🏆 Challenge Joined! +${challenge.xp} XP` });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setJoining(null); }
  };

  const getDiffColor = (d: string) => d === 'Easy' ? 'text-green-400 bg-green-500/10' : d === 'Medium' ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10';

  return (
    <>
      <FloatingHowItWorks title="How Weekly Cooking Challenge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="font-bold text-yellow-400">Weekly Cooking Challenge</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">Free</span>
        </div>
        <p className="text-muted-foreground text-sm">Compete, cook, and climb the leaderboard!</p>
      </div>

      {/* XP Bar */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-yellow-500/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-black text-xl">{level}</div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-bold">Level {level} Chef</span>
              <span className="text-xs text-muted-foreground">{xpInLevel}/{xpToNext} XP</span>
            </div>
            <Progress value={(xpInLevel / xpToNext) * 100} className="h-3" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-yellow-400">{userXp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
      </Card>

      {/* Challenges */}
      <div>
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Flame className="h-5 w-5 text-orange-400" /> This Week's Challenges</h3>
        <div className="space-y-3">
          {WEEKLY_CHALLENGES.map(ch => (
            <Card key={ch.id} className={`p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:border-yellow-500/30 transition-colors ${joinedChallenges.has(ch.id) ? 'border-green-500/30 bg-green-500/5' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm">{ch.title}</h4>
                    <Badge className={`text-[10px] ${getDiffColor(ch.difficulty)}`}>{ch.difficulty}</Badge>
                    <Badge variant="outline" className="text-[10px]">{ch.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{ch.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-yellow-400 font-bold">+{ch.xp} XP</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{ch.participants} joined</span>
                  </div>
                </div>
                <Button size="sm" disabled={joinedChallenges.has(ch.id) || joining === ch.id}
                  className={joinedChallenges.has(ch.id) ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}
                  onClick={() => joinChallenge(ch)}>
                  {joining === ch.id ? <Loader2 className="h-3 w-3 animate-spin" /> : joinedChallenges.has(ch.id) ? '✓ Joined' : 'Join'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Medal className="h-5 w-5 text-yellow-400" /> Global Leaderboard</h3>
        <Card className="bg-card/80 backdrop-blur-xl border-border/60 overflow-hidden">
          {LEADERBOARD.map(entry => (
            <div key={entry.rank} className={`flex items-center gap-3 p-3 border-b border-border/30 last:border-0 ${entry.rank <= 3 ? 'bg-yellow-500/5' : ''}`}>
              <span className="text-xl w-8 text-center">{entry.badge}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{entry.name}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-yellow-400">{entry.xp.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
    </>
    );
}
