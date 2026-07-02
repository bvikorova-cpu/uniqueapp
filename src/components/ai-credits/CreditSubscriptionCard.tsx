import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const PLANS = [
  { credits: 50, price: 15, name: "Lite Monthly" },
  { credits: 150, price: 35, name: "Pro Monthly", popular: true },
  { credits: 400, price: 80, name: "Studio Monthly" },
];

export function CreditSubscriptionCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const subscribe = async (p: typeof PLANS[number]) => {
    setLoading(p.name);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product: "ai_credits_subscription",
          mode: "subscription",
          amount: p.price * 100,
          productName: `${p.name} — ${p.credits} credits/mo`,
          interval: "month",
          metadata: { credits_per_cycle: String(p.credits) },
          successUrl: `${window.location.origin}/ai-credits-store?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/ai-credits-store?payment=canceled`,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Credit Subscription Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Credit Subscription Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Credit Subscription Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-5xl mx-auto mb-8 border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-primary" />
          <CardTitle>Subscribe to credits — never run out</CardTitle>
        </div>
        <CardDescription>Monthly auto-delivery with roll-over up to 12 months. Cancel anytime.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <Card key={p.name} className={`p-4 ${p.popular ? "ring-2 ring-primary" : ""}`}>
              {p.popular && <Badge className="mb-2">Most popular</Badge>}
              <h3 className="font-bold">{p.name}</h3>
              <div className="text-3xl font-black my-2">€{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground mb-3">{p.credits} credits / month</p>
              <ul className="text-xs space-y-1 mb-3">
                <li className="flex gap-1"><Check className="h-3 w-3 text-emerald-500" /> Roll-over up to 12mo</li>
                <li className="flex gap-1"><Check className="h-3 w-3 text-emerald-500" /> Cancel anytime</li>
                <li className="flex gap-1"><Check className="h-3 w-3 text-emerald-500" /> Save vs one-off</li>
              </ul>
              <Button className="w-full" disabled={loading === p.name} onClick={() => subscribe(p)}>
                {loading === p.name ? "..." : "Subscribe"}
              </Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
