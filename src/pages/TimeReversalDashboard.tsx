import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Lock, Eye, Sparkles, Coins, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useTimeReversalCredits, TIME_REVERSAL_COSTS, type TimeReversalAction } from "@/hooks/useTimeReversalCredits";
import { toast } from "sonner";
import { useState } from "react";

const POWERS: Array<{
  action: TimeReversalAction;
  name: string;
  description: string;
  icon: typeof Zap;
  features: string[];
  successMsg: string;
}> = [
  {
    action: "speed_boost",
    name: "Time Travel Speed",
    description: "Age backwards faster than ever",
    icon: Zap,
    features: ["2x faster aging reversal", "Fast-forward through decades", "Priority timeline updates"],
    successMsg: "Speed boost activated for your next transformation.",
  },
  {
    action: "age_lock",
    name: "Age Lock",
    description: "Freeze time at your perfect age",
    icon: Lock,
    features: ["Pause at any age you want", "Create custom milestones", "Resume aging anytime"],
    successMsg: "Age lock applied to your timeline.",
  },
  {
    action: "future_glimpse",
    name: "Future Glimpse",
    description: "See your future self",
    icon: Eye,
    features: ["Preview any future age", "AI-generated future photos", "What-if scenarios"],
    successMsg: "Future glimpse unlocked — open My Timeline to explore it.",
  },
  {
    action: "paradox_post",
    name: "Time Paradox Post",
    description: "Post across different timelines",
    icon: Sparkles,
    features: ["Post from any age", "Cross-timeline content", "Special paradox badge"],
    successMsg: "Paradox post unlocked — share it in the Social Feed.",
  },
];

export default function TimeReversalDashboard() {
  const { balance, loading, spend } = useTimeReversalCredits();
  const [busy, setBusy] = useState<TimeReversalAction | null>(null);
  const navigate = useNavigate();

  const use = async (p: (typeof POWERS)[number]) => {
    setBusy(p.action);
    try {
      const ok = await spend(p.action, `time-reversal:${p.action}`);
      if (ok) toast.success(p.name, { description: p.successMsg });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <FloatingHowItWorks title="Time Reversal Dashboard" steps={[
        { title: "Credit-based", desc: "No subscription — every power costs credits." },
        { title: "Pick a power", desc: "Speed, age lock, future glimpse or paradox post." },
        { title: "Credits are deducted instantly", desc: "Every spend is logged in your credit ledger." },
        { title: "Top up anytime", desc: "Buy credits in the AI Credits store." },
      ]} />
      <div className="min-h-screen bg-background p-4 md:p-6 pt-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Time Reversal Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Pay-per-use time manipulation — powered by AI credits</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Coins className="w-3.5 h-3.5 mr-1" />
                {balance} credits
              </Badge>
              <Button variant="outline" onClick={() => navigate("/ai-credits")}>Buy credits</Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POWERS.map((p) => (
              <Card key={p.action} className="border-border/50 bg-card/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <p.icon className="h-7 w-7 text-primary" />
                    <Badge className="bg-primary/15 text-primary border border-primary/30">
                      {TIME_REVERSAL_COSTS[p.action]} credits
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription className="text-xs">{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    disabled={busy === p.action}
                    onClick={() => use(p)}
                  >
                    {busy === p.action ? <Loader2 className="w-4 h-4 animate-spin" /> : `Use (${TIME_REVERSAL_COSTS[p.action]})`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/time-reversal")}>Back to hub</Button>
              <Button variant="outline" onClick={() => navigate("/time-reversal/timeline")}>My Timeline</Button>
              <Button variant="outline" onClick={() => navigate("/ai-credits")}>Credit history</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
