import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Calendar, Timer, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";
import { ESCAPE_ROOM_CREDIT_COSTS } from "@/hooks/useEscapeRoomCredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const items = [
  {
    icon: Lock,
    name: "Play any escape room",
    cost: ESCAPE_ROOM_CREDIT_COSTS.play_room,
    desc: "Unlock a full room run — puzzles, hints and timer included.",
  },
  {
    icon: Calendar,
    name: "Season Pass",
    cost: ESCAPE_ROOM_CREDIT_COSTS.season_pass,
    desc: "Seasonal reward track, weekly challenges and exclusive rooms.",
  },
  {
    icon: Timer,
    name: "Speedrun tournament entry",
    cost: ESCAPE_ROOM_CREDIT_COSTS.tournament_entry,
    desc: "Join a timed tournament and race for the leaderboard.",
  },
  {
    icon: Wand2,
    name: "AI tools (puzzles, story, hints, themes...)",
    cost: 3,
    desc: "Each AI generator costs 3–5 credits per run.",
  },
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { totalBalance } = useAICredits();

  return (
    <>
      <FloatingHowItWorks
        title="Credit Pricing - How it works"
        steps={[
          { title: 'Top up', desc: 'Buy AI credits once — no subscriptions anywhere in Escape Rooms.' },
          { title: 'Pick', desc: 'Choose a room, pass, tournament or AI tool.' },
          { title: 'Pay in credits', desc: 'The credit cost is deducted instantly from your balance.' },
          { title: 'Play', desc: 'Your unlock starts right away and is logged in your credit history.' },
        ]}
      />
      <div className="space-y-6">
        <div className="text-center">
          <Badge variant="secondary" className="mb-3 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />Credits only
          </Badge>
          <h2 className="text-3xl font-bold mb-3">Escape Room Credit Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything in Virtual Escape Rooms is paid with credits — no subscriptions, no monthly plans.
            Your balance: <span className="font-bold text-foreground">{totalBalance} credits</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.name} className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 whitespace-nowrap">
                      {item.cost} CR
                    </Badge>
                  </div>
                  <CardDescription className="pt-2">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className="max-w-4xl mx-auto bg-gradient-subtle">
          <CardHeader>
            <CardTitle>Need more credits?</CardTitle>
            <CardDescription>Top up your balance and use it across the whole platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full sm:w-auto" onClick={() => navigate("/ai-credits")}>
              <Sparkles className="w-4 h-4 mr-2" />Get credits
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SubscriptionPlans;
