import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles, Check } from "lucide-react";
import { useTeenCareerCredits, TEEN_CAREER_CREDIT_COST } from "@/hooks/useTeenCareerCredits";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const PACKS = [
  { credits: 10, label: "Starter",   highlight: false, perks: ["2 guidance sessions", "PDF export", "Career comparison"] },
  { credits: 25, label: "Explorer",  highlight: true,  perks: ["5 guidance sessions", "Best value (€0.50/credit)", "All features"] },
  { credits: 50, label: "Visionary", highlight: false, perks: ["10 guidance sessions", "Bulk discount", "All features"] },
];

export default function TeenCareerPricing() {
  const { balance, purchase, costPerUse } = useTeenCareerCredits();
  const navigate = useNavigate();
  const [loadingPack, setLoadingPack] = useState<number | null>(null);

  const handleBuy = async (credits: number) => {
    setLoadingPack(credits);
    const url = await purchase(credits);
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
    setLoadingPack(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="text-center mb-10">
          <Briefcase className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Career Counselor Credits</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each AI career guidance session costs <strong>{TEEN_CAREER_CREDIT_COST}</strong> credits.
            Buy a pack and start exploring your future.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Current balance: {balance} credits</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PACKS.map((p) => {
            const sessions = Math.floor(p.credits / costPerUse);
            return (
              <Card
                key={p.credits}
                className={p.highlight ? "border-primary border-2 shadow-xl shadow-primary/10 relative" : ""}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{p.label}</CardTitle>
                  <CardDescription>{p.credits} credits · ≈ {sessions} sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">€{((p.credits * 0.5)).toFixed(2)}</div>
                  <ul className="space-y-2 text-sm">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={p.highlight ? "default" : "outline"}
                    onClick={() => handleBuy(p.credits)}
                    disabled={loadingPack === p.credits}
                  >
                    {loadingPack === p.credits ? "Loading..." : `Buy ${p.credits} credits`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate("/teen-career-counselor")}>
            ← Back to Career Counselor
          </Button>
        </div>
      </main>
    </div>
  );
}
