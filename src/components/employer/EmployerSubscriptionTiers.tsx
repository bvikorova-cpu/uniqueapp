import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Employer features run on the unified AI credits wallet — no Stripe subscriptions.
const CREDIT_PACKS = [
  { name: "Basic",
    credits: 20,
    icon: Zap,
    features: [
      "5 job listings",
      "Application management",
      "Job analytics",
    ],
    popular: false },
  { name: "Premium",
    credits: 60,
    icon: Crown,
    features: [
      "20 job listings",
      "Featured job listings",
      "Advanced analytics",
      "AI job description writer",
    ],
    popular: true },
  { name: "Enterprise",
    credits: 150,
    icon: Sparkles,
    features: [
      "60 job listings",
      "AI candidate ranking",
      "Priority placement",
      "Custom branding",
    ],
    popular: false },
];

export function EmployerSubscriptionTiers() {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Employer credits - How it works"} steps={[{ title: 'Get credits', desc: 'Top up once at AI Credits — no subscription.' }, { title: 'Post jobs', desc: 'Each listing and AI tool costs credits.' }, { title: 'Manage', desc: 'Review applications and analytics in your dashboard.' }, { title: 'Top up anytime', desc: 'Credits never expire and work across the whole platform.' }]} />
      <div className="space-y-6">
        <Card className="border-primary/30">
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-2">Credits only</Badge>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Pay with credits, not subscriptions
            </CardTitle>
            <CardDescription>
              Job listings and AI hiring tools are paid from your credit balance. One wallet for the whole platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/ai-credits")}>
              <Coins className="h-4 w-4 mr-2" /> Get credits
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {CREDIT_PACKS.map((tier) => (
            <Card key={tier.name} className={tier.popular ? "border-2 border-primary" : "border-border/30"}>
              <CardHeader>
                {tier.popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                  <tier.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Coins className="h-4 w-4 text-primary" /> {tier.credits} credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
