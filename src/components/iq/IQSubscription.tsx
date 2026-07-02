import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Crown, Sparkles, Check, Loader2 } from "lucide-react";
import { trackIQEvent } from "@/lib/iqAnalytics";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const TIERS = [
  {
    id: "pro",
    name: "IQ Pro",
    price: "9.99",
    icon: Sparkles,
    perks: [
      "Unlimited IQ tests",
      "+50 monthly credits",
      "Pro-only AI tools",
      "No cooldowns",
    ],
  },
  {
    id: "elite",
    name: "IQ Elite",
    price: "19.99",
    icon: Crown,
    perks: [
      "Everything in Pro",
      "+150 monthly credits",
      "Tournament priority entry",
      "Personal AI coach",
      "Verified Elite badge",
    ],
  },
];

export default function IQSubscription() {
  const [loading, setLoading] = useState<string | null>(null);

  const { data: sub, refetch } = useQuery({
    queryKey: ["iq-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("iq-check-subscription");
      if (error) throw error;
      return data as { subscribed: boolean; tier: string; current_period_end?: string };
    },
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") === "true") {
      toast({ title: "🎉 Welcome to IQ Pro!", description: "Your subscription is being activated." });
      setTimeout(() => refetch(), 2000);
    }
  }, [refetch]);

  const handleSubscribe = async (tier: string) => {
    setLoading(tier);
    trackIQEvent("iq_subscription_click", { tier });
    try {
      const { data, error } = await supabase.functions.invoke("iq-create-subscription", {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const currentTier = sub?.tier ?? "free";

  return (
    <>
      <FloatingHowItWorks title="How IQSubscription works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            IQ Subscription
          </span>
          {sub?.subscribed && (
            <Badge className="bg-gradient-to-r from-primary to-accent border-0">
              {currentTier.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-3">
        {TIERS.map((t) => {
          const Icon = t.icon;
          const isCurrent = currentTier === t.id;
          return (
            <div
              key={t.id}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isCurrent
                  ? "border-primary bg-gradient-to-br from-primary/15 to-accent/10 shadow-lg shadow-primary/20"
                  : "border-border/40 bg-muted/20 hover:border-primary/40"
              }`}
            >
              {isCurrent && (
                <Badge className="absolute -top-2 right-3 bg-primary border-0">Current</Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${t.id === "elite" ? "text-amber-400" : "text-primary"}`} />
                <h3 className="font-bold">{t.name}</h3>
              </div>
              <p className="text-2xl font-black mb-3">
                €{t.price}<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-1 mb-4">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                disabled={loading !== null || isCurrent}
                variant={isCurrent ? "outline" : "default"}
                onClick={() => handleSubscribe(t.id)}
              >
                {loading === t.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Active"
                ) : (
                  `Subscribe €${t.price}/mo`
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
    </>
    );
}
