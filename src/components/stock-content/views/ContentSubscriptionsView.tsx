import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Check, Zap, Star, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ContentSubscriptionsViewProps {
  onBack: () => void;
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 9.99,
    icon: Zap,
    color: "from-blue-500 to-blue-700",
    downloads: 25,
    features: ["25 downloads/month", "Standard resolution", "Personal license", "Email support", "Basic search filters"],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 29.99,
    icon: Star,
    color: "from-purple-500 to-violet-700",
    downloads: 100,
    features: ["100 downloads/month", "High resolution", "Commercial license", "Priority support", "Advanced filters", "AI-enhanced previews", "Collection access"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 79.99,
    icon: Shield,
    color: "from-amber-500 to-orange-700",
    downloads: -1,
    features: ["Unlimited downloads", "Maximum resolution", "Extended commercial license", "Dedicated support", "API access", "Team management", "Custom collections", "Priority AI tools", "White-label rights"],
    popular: false,
  },
];

export function ContentSubscriptionsView({ onBack }: ContentSubscriptionsViewProps) {
  const { toast } = useToast();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, price: number, name: string) => {
    setSubscribing(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in to subscribe");

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceAmount: Math.round(price * 100),
          productName: `Stock Content - ${name} Plan`,
          mode: "subscription",
          metadata: { type: "stock_content_subscription", plan: planId },
          successUrl: `${window.location.origin}/stock-content?purchase=success`,
          cancelUrl: `${window.location.origin}/stock-content?purchase=cancelled`,
        },
      });
      if (error) throw error;
      if (data?.url) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
    } catch (error: any) {
      toast({ title: "Subscription Failed", description: error.message, variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Content Subscriptions View - How it works"} steps={[{ title: 'Open', desc: 'Access the Content Subscriptions View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Content Subscriptions View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Crown className="w-6 h-6 text-amber-500" /> Content Subscription Plans</h2>
      </div>

      <div className="text-center mb-8">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock unlimited access to premium stock content with our subscription plans. Save up to 70% compared to individual purchases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.id} className={`relative p-6 space-y-4 transition-all hover:shadow-xl ${plan.popular ? "border-2 border-purple-500 scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">Most Popular</Badge>
              )}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div>
                <span className="text-3xl font-black">€{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.downloads === -1 ? "Unlimited downloads" : `${plan.downloads} downloads per month`}
              </p>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.id, plan.price, plan.name)}
                disabled={subscribing === plan.id}
                className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-500 to-violet-600" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                {subscribing === plan.id ? "Processing..." : "Subscribe Now"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
}
