import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Swords, Flame, Trophy, BookOpen, Film, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useTimeReversalCredits, TIME_REVERSAL_COSTS } from "@/hooks/useTimeReversalCredits";
import { HOLO_COSTS } from "@/hooks/useHolographicCredits";

interface Props { onBack: () => void; }

const ITEMS = [
  { key: "timelapse", name: "Time-Lapse Creator", icon: Film, cost: TIME_REVERSAL_COSTS.timelapse, description: "Generate the full AI age-progression collage, published to the public gallery" },
  { key: "life_story", name: "Reverse Life Story", icon: BookOpen, cost: TIME_REVERSAL_COSTS.life_story, description: "AI writes your biography backwards" },
  { key: "battle_1v1", name: "Age Battle — 1v1 Duel", icon: Swords, cost: HOLO_COSTS.battle_1v1, description: "One AI opponent, 3 rounds, +80 XP for a win" },
  { key: "battle_survival", name: "Age Battle — Survival", icon: Flame, cost: HOLO_COSTS.battle_survival, description: "Endurance run, 4 rounds, +300 XP for a win" },
  { key: "battle_tournament", name: "Age Battle — Tournament", icon: Trophy, cost: HOLO_COSTS.battle_tournament, description: "Toughest opponents, 5 rounds, +600 XP for a win" },
] as const;

export function TimeReversalPlans({ onBack }: Props) {
  const navigate = useNavigate();
  const { balance, loading } = useTimeReversalCredits();

  return (
    <>
      <FloatingHowItWorks title="Time Reversal Credits" steps={[
        { title: "No subscription", desc: "Everything is pay-per-use with AI credits." },
        { title: "Check the cost", desc: "Each tool shows its credit price." },
        { title: "Credits are deducted after success", desc: "Failed generations are not charged." },
        { title: "Top up anytime", desc: "Buy credits in the AI Credits store." },
      ]} />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <Badge variant="secondary" className="text-sm">
            <Coins className="w-3.5 h-3.5 mr-1" />
            {loading ? "…" : balance} credits
          </Badge>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
            <Clock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Credit Costs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Time Reversal is fully credit-based — no monthly subscription. Pay only for what you generate. Browsing the public gallery is always free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ITEMS.map((item) => (
            <Card key={item.key} className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="bg-primary/15 text-primary border border-primary/30">{item.cost} credits</Badge>
                </div>
                <CardTitle className="text-base mt-2">{item.name}</CardTitle>
                <CardDescription className="text-xs">{item.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold">Need more credits?</h3>
              <p className="text-sm text-muted-foreground">Top up once and use them across every AI tool on the platform.</p>
            </div>
            <Button onClick={() => navigate("/ai-credits")}>Buy credits</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
