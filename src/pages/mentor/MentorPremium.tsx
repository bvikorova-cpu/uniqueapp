import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorPremium, useMentorCheckout } from "@/hooks/useMentorRouter";
import { Crown, Check, Sparkles } from "lucide-react";

export default function MentorPremium() {
  const { data: sub } = useMentorPremium();
  const checkout = useMentorCheckout();

  const features = [
    "Conversation memory across sessions",
    "20 named skills with progress tracking",
    "Big Five personality assessment + insights",
    "12 role-play scenarios (interview, negotiation, hard talks)",
    "Anonymous 360° feedback (shareable link)",
    "Daily AI nudges per coaching area",
    "SMART goals with AI-generated milestones",
    "Reflection prompts by mood",
    "Habit tracking with freeze tokens",
    "4 coach personalities (Tough Love, Empathic, Socratic, Motivator)",
    "Session summaries with commitments",
    "Voice journaling with emotion detection",
    "21-day CBT programs (Anxiety, Confidence, Relationships)",
    "Unlimited AI chat with context",
  ];

  return (
    <>
      <Helmet><title>Personal Mentor Premium · Unique</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="text-center mb-10">
          <Crown className="w-12 h-12 mx-auto text-primary mb-3" />
          <h1 className="text-4xl font-black mb-2">Personal Mentor Premium</h1>
          <p className="text-muted-foreground">Unlock all 18 mentor features. Cancel anytime.</p>
          {sub?.subscribed && (
            <p className="mt-3 text-sm text-primary font-bold">
              ✓ Active — {sub.plan} plan{sub.current_period_end ? ` · renews ${new Date(sub.current_period_end).toLocaleDateString()}` : ""}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="backdrop-blur-xl bg-card/80 border-border/50">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Monthly</div>
              <div className="text-4xl font-black mb-1">€14.99<span className="text-base text-muted-foreground font-normal">/mo</span></div>
              <p className="text-xs text-muted-foreground mb-4">Billed monthly · cancel anytime</p>
              <Button className="w-full" variant="outline" onClick={() => checkout.mutate("monthly")} disabled={checkout.isPending || sub?.subscribed}>
                {sub?.plan === "monthly" ? "Current plan" : "Choose Monthly"}
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-primary/15 to-accent/10 border-primary/50 relative">
            <span className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Save 17%
            </span>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Yearly</div>
              <div className="text-4xl font-black mb-1">€149.90<span className="text-base text-muted-foreground font-normal">/yr</span></div>
              <p className="text-xs text-muted-foreground mb-4">€12.49/mo · 2 months free</p>
              <Button className="w-full" onClick={() => checkout.mutate("yearly")} disabled={checkout.isPending || sub?.subscribed}>
                {sub?.plan === "yearly" ? "Current plan" : "Choose Yearly"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-xl bg-card/80">
          <CardContent className="p-6">
            <h2 className="font-black mb-4">Everything included</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link to="/ai-mentor/hub" className="text-sm text-primary hover:underline">← Back to Mentor Hub</Link>
        </div>
      </div>
    </>
  );
}
