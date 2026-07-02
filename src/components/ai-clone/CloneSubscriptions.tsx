import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Star, Crown, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const subscriptionTiers = [
  {
    name: "Basic Clone",
    price: "9.99",
    tier: "basic",
    icon: Zap,
    color: "text-blue-400",
    features: [
      "1 AI personality clone",
      "100 conversations per month",
      "Basic personality training",
      "Standard response time",
      "Community access"
    ],
    popular: false
  },
  {
    name: "Advanced Clone",
    price: "29.99",
    tier: "advanced",
    icon: Star,
    color: "text-purple-400",
    features: [
      "3 AI personality clones",
      "Unlimited conversations",
      "Advanced learning from interactions",
      "Priority response time",
      "Personality fine-tuning",
      "Conversation analytics",
      "Export conversations"
    ],
    popular: true
  },
  {
    name: "Celebrity Clone",
    price: "99.00",
    tier: "celebrity",
    icon: Crown,
    color: "text-yellow-400",
    features: [
      "Unlimited AI clones",
      "Public celebrity profile",
      "Revenue sharing from clone chats",
      "Premium marketplace placement",
      "Advanced analytics dashboard",
      "Custom branding",
      "API access",
      "Dedicated support"
    ],
    popular: false
  }
];

export function CloneSubscriptions() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    try {
      setSubscribingTier(tier);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please sign in to subscribe", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { productKey: `clone_${tier}` },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setSubscribingTier(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Clone Subscriptions - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Subscriptions section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Subscriptions.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle>Choose Your Clone Subscription</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card 
              key={tier.name}
              className={`relative bg-card/80 backdrop-blur-xl ${tier.popular ? 'border-primary shadow-lg shadow-primary/10 scale-105' : 'border-primary/20'}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-8 w-8 ${tier.color}`} />
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">€{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={tier.popular ? "default" : "outline"}
                  disabled={subscribingTier === tier.tier}
                  onClick={() => handleSubscribe(tier.tier)}
                >
                  {subscribingTier === tier.tier ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                  ) : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 border border-border/50 rounded-lg bg-background/50">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Clone-to-Clone Dating</h4>
                <p className="text-sm text-muted-foreground">€4.99 per session</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-border/50 rounded-lg bg-background/50">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Conversation Export</h4>
                <p className="text-sm text-muted-foreground">€2.00 per export</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
