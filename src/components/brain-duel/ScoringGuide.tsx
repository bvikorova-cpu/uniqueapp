import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Zap, Trophy, Coins } from "lucide-react";

/**
 * Short, always-visible explainer of how Brain Duel scoring and results work.
 * Presentation only — no game logic here.
 */
export function ScoringGuide() {
  const rows = [
    {
      icon: Target,
      title: "Correct answer = 100 points",
      desc: "Every question you answer correctly adds 100 base points. Wrong or unanswered questions add 0.",
    },
    {
      icon: Zap,
      title: "Speed bonus = 10 points per saved second",
      desc: "Answer fast and you keep the remaining seconds as bonus points (e.g. answering with 8s left adds 80 points).",
    },
    {
      icon: Trophy,
      title: "Highest total score wins",
      desc: "Both players get the same questions. The higher final score wins — so a fast player can beat a slower one with the same number of correct answers.",
    },
    {
      icon: Coins,
      title: "Credits are paid automatically",
      desc: "When the duel is closed, the winner always receives the reward credits and a notification — no matter who finishes last.",
    },
  ];

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Info className="h-4 w-4 text-primary" />
          How scoring &amp; results work
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.title} className="flex gap-3 rounded-lg border border-primary/10 bg-muted/30 p-3">
            <r.icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{r.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          If your opponent stops playing, the duel closes automatically after 2 minutes of no progress — or you can
          press <span className="font-semibold text-foreground">Finish duel now</span> on the waiting screen.
        </p>
      </CardContent>
    </Card>
  );
}

export default ScoringGuide;
