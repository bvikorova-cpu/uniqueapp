import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChefHat, Coins, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  CHEF_PASS_OPTIONS,
  KITCHENSTARS_COSTS,
  useMasterChefAccess,
  type ChefPassType,
} from "@/hooks/useMasterChefAccess";

const PASS_META: Record<ChefPassType, { icon: typeof ChefHat; popular: boolean; features: string[] }> = {
  day: {
    icon: ChefHat,
    popular: false,
    features: [
      "Chef dashboard for 24 hours",
      "Enter competitions & kitchen battles",
      "Post recipes to the feed",
      "Receive gifts and tips from fans",
    ],
  },
  week: {
    icon: Crown,
    popular: true,
    features: [
      "Everything in the Day Pass",
      "7 full days of chef access",
      "Live cook-along streaming",
      "Weekly awards eligibility",
    ],
  },
  month: {
    icon: Sparkles,
    popular: false,
    features: [
      "Everything in the Week Pass",
      "30 full days of chef access",
      "Best value per day",
      "Priority placement in the chef feed",
    ],
  },
};

export default function MasterChefSubscription() {
  const navigate = useNavigate();
  const { balance, hasPass, expiresAt, loading, activatePass } = useMasterChefAccess();
  const [busy, setBusy] = useState<ChefPassType | null>(null);

  const handleActivate = async (type: ChefPassType) => {
    setBusy(type);
    const ok = await activatePass(type);
    setBusy(null);
    if (ok) navigate("/masterchef/dashboard");
  };

  return (
    <>
      <FloatingHowItWorks
        title="How the KitchenStars Chef Pass works"
        steps={[
          { title: "Top up credits", desc: "KitchenStars runs entirely on AI credits — no subscriptions." },
          { title: "Buy a Chef Pass", desc: "Spend 5, 25 or 80 credits for 1 day, 7 days or 30 days of chef access." },
          { title: "Cook & compete", desc: `Competition and battle entries cost ${KITCHENSTARS_COSTS.competition_entry} credits, AI kitchen tools ${KITCHENSTARS_COSTS.ai_recipe} credits.` },
          { title: "Earn", desc: "Voting stays free for everyone; chefs keep tips and prize winnings." },
        ]}
      />
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-background to-red-500/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/masterchef/competitions-public")}>
              ← View Public Competitions
            </Button>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => navigate("/masterchef/dashboard")}>
              Go to Dashboard →
            </Button>
          </div>

          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4">Credits only • no subscriptions</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              KitchenStars Chef Pass
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything in KitchenStars is paid with AI credits. Pick a Chef Pass to unlock the chef
              dashboard, competitions and live cooking.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-semibold">{loading ? "…" : balance} credits</span>
              <Button size="sm" variant="ghost" onClick={() => navigate("/ai-credits")}>Top up</Button>
            </div>

            {hasPass && expiresAt && (
              <p className="mt-4 text-sm text-primary font-medium">
                Chef Pass active until {new Date(expiresAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {(Object.keys(CHEF_PASS_OPTIONS) as ChefPassType[]).map((type) => {
              const option = CHEF_PASS_OPTIONS[type];
              const meta = PASS_META[type];
              const Icon = meta.icon;
              return (
                <Card key={type} className={meta.popular ? "border-primary shadow-lg relative" : "relative"}>
                  {meta.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
                  )}
                  <CardHeader className="text-center">
                    <Icon className="h-10 w-10 mx-auto mb-2 text-primary" />
                    <CardTitle>{option.label}</CardTitle>
                    <CardDescription>{option.desc}</CardDescription>
                    <div className="mt-3 text-3xl font-black">
                      {option.credits} <span className="text-base font-semibold text-muted-foreground">credits</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {meta.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={meta.popular ? "default" : "outline"}
                      disabled={busy !== null || loading}
                      onClick={() => handleActivate(type)}
                    >
                      {busy === type ? "Activating…" : hasPass ? `Extend for ${option.credits} credits` : `Unlock for ${option.credits} credits`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle className="text-lg">Credit costs inside KitchenStars</CardTitle>
              <CardDescription>Voting and browsing competitions is always free.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
              <div className="flex justify-between"><span>Competition entry</span><span className="font-semibold">{KITCHENSTARS_COSTS.competition_entry} credits</span></div>
              <div className="flex justify-between"><span>Kitchen battle entry</span><span className="font-semibold">{KITCHENSTARS_COSTS.battle_entry} credits</span></div>
              <div className="flex justify-between"><span>AI recipe generator</span><span className="font-semibold">{KITCHENSTARS_COSTS.ai_recipe} credits</span></div>
              <div className="flex justify-between"><span>AI cooking coach</span><span className="font-semibold">{KITCHENSTARS_COSTS.ai_coach} credits</span></div>
              <div className="flex justify-between"><span>Ingredient scanner</span><span className="font-semibold">{KITCHENSTARS_COSTS.ingredient_scan} credits</span></div>
              <div className="flex justify-between"><span>Nutrition analyzer</span><span className="font-semibold">{KITCHENSTARS_COSTS.nutrition_analysis} credits</span></div>
              <div className="flex justify-between"><span>Chef chat</span><span className="font-semibold">{KITCHENSTARS_COSTS.chef_chat} credits</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
