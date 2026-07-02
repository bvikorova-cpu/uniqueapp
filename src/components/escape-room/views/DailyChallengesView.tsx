import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, Clock, Trophy, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function DailyChallengesView({ onBack }: Props) {
  const challenges = [
    { title: "Speed Run: Detective's Office", desc: "Complete in under 15 minutes", reward: "200 XP + Speed Badge", difficulty: "Hard", timeLeft: "8h 42m", status: "active" },
    { title: "No-Hint Challenge", desc: "Complete any horror room without hints", reward: "300 XP", difficulty: "Expert", timeLeft: "8h 42m", status: "active" },
    { title: "Team Challenge", desc: "Complete Mars Colony with 4+ players", reward: "150 XP + Team Badge", difficulty: "Medium", timeLeft: "8h 42m", status: "active" },
  ];

  const completed = [
    { title: "Puzzle Master", desc: "Solve 10 riddle puzzles", reward: "100 XP", completed: "2 hours ago" },
    { title: "Explorer", desc: "Try 3 different themes", reward: "75 XP", completed: "Yesterday" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Daily Challenges View - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Challenges View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Challenges View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Daily Challenges</h2>
            <p className="text-muted-foreground">Fresh puzzles every 24 hours</p>
          </div>
        </div>

        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Lock className="w-4 h-4" />Active Challenges</h3>
        <div className="space-y-3 mb-6">
          {challenges.map((c, i) => (
            <Card key={i} className="border-orange-500/10 hover:border-orange-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.desc}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{c.difficulty}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-500 font-semibold">🎁 {c.reward}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{c.timeLeft}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-emerald-500" />Completed Today</h3>
        <div className="space-y-2">
          {completed.map((c, i) => (
            <Card key={i} className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-500 font-semibold">{c.reward}</div>
                  <div className="text-[10px] text-muted-foreground">{c.completed}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
