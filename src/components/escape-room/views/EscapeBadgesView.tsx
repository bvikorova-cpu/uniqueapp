import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const badges = [
  { name: "First Escape", desc: "Complete your first room", icon: "🔓", earned: true, xp: 50 },
  { name: "Speed Demon", desc: "Complete a room under 20 minutes", icon: "⚡", earned: true, xp: 100 },
  { name: "Hint-Free", desc: "Complete a room without any hints", icon: "🧠", earned: true, xp: 150 },
  { name: "Team Player", desc: "Complete a room with 4+ players", icon: "👥", earned: true, xp: 75 },
  { name: "Horror Master", desc: "Complete all horror rooms", icon: "👻", earned: false, xp: 200, progress: 60 },
  { name: "Mystery Maven", desc: "Complete all mystery rooms", icon: "🔍", earned: false, xp: 200, progress: 40 },
  { name: "Room Creator", desc: "Create and publish 5 rooms", icon: "🏗️", earned: false, xp: 250, progress: 20 },
  { name: "Perfectionist", desc: "Score 950+ on any room", icon: "💎", earned: false, xp: 300, progress: 85 },
  { name: "Marathon Runner", desc: "Play 10 rooms in one day", icon: "🏃", earned: false, xp: 200, progress: 30 },
  { name: "Legend", desc: "Reach 10,000 total XP", icon: "🏆", earned: false, xp: 500, progress: 15 },
];

export function EscapeBadgesView({ onBack }: Props) {
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
            <p className="text-muted-foreground">{earned}/{badges.length} earned • {totalXP} XP</p>
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
                  {!b.earned && b.progress !== undefined && (
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
      </div>
    </div>
    </>
  );
}
