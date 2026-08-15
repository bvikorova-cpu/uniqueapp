import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";
import { useEscapeRoomRealStats } from "@/hooks/useEscapeRoomRealStats";
import { computeEscapeBadges } from "../escapeBadges";

interface Props { onBack: () => void; }


export function EscapeBadgesView({ onBack }: Props) {
  const { user, loading } = useEscapeRoomRealStats();
  const badges = computeEscapeBadges(user);
  const earned = badges.filter(b => b.earned).length;
  const totalXP = badges.filter(b => b.earned).reduce((s, b) => s + b.xp, 0);

  return (
    <>
      <FloatingHowItWorks title={"Escape Badges View - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape Badges View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Escape Badges View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Achievement Badges</h2>
            <p className="text-muted-foreground">{loading ? "Loading your progress…" : `${earned}/${badges.length} earned • ${totalXP} badge XP • ${user.totalXp} score XP`}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {badges.map((b, i) => (
            <Card key={i} className={`${b.earned ? "border-amber-500/30 bg-amber-500/5" : "opacity-70"}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="text-3xl">{b.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center gap-2">
                    {b.name}
                    {b.earned && <Badge className="text-[10px] bg-amber-500/20 text-amber-600 border-amber-500/30">Earned</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{b.desc}</div>
                  {!b.earned && (
                    <Progress value={b.progress} className="h-1.5 mt-1.5" />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-amber-500">+{b.xp}</div>
                  <div className="text-[10px] text-muted-foreground">XP</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background/80 to-background/40 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">How Badges Work</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { step: "1", title: "Enter a Room", desc: "Pick a themed escape room and pay the credit entry." },
              { step: "2", title: "Solve Puzzles", desc: "Find clues, crack codes, and beat the timer." },
              { step: "3", title: "Earn XP", desc: "Complete challenges to unlock badge rewards." },
              { step: "4", title: "Track Progress", desc: "Watch your collection grow and climb the leaderboard." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-950/20 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-300">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-100">{item.title}</p>
                  <p className="text-xs text-amber-200/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
