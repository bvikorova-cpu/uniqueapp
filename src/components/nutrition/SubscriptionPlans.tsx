import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useNutritionSubscription } from "@/hooks/useNutritionSubscription";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const plans = [
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    popular: true,
    features: [
      'Unlimited meal plans',
      'Unlimited food scans',
      'Macro optimization',
      'Shopping lists',
      'Healthier alternatives',
      'Unlimited restaurant analyses'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    features: [
      'Everything in Premium',
      'Family mode (4 people)',
      'Allergen tracking',
      'Diet preferences',
      'Priority AI processing',
      'Export meal plans'
    ]
  },
  {
    id: 'starter',
    name: 'Scanner Starter',
    price: 4.99,
    interval: 'month',
    features: [
      '50 food scans/day',
      'Scan history',
      'Nutrition breakdown'
    ]
  },
  {
    id: 'athlete',
    name: 'Macro Athlete',
    price: 12.99,
    interval: 'month',
    features: [
      'AI macro coach',
      'Daily macro adjustments',
      'Progress analytics',
      'Performance tracking'
    ]
  }
];

export default function SubscriptionPlans() {
  const { subscription, upgrade } = useNutritionSubscription();

  const handleUpgrade = async (planId: string) => {
    try {
      await upgrade(planId);
      toast.success(`Upgraded to ${planId}!`);
    } catch (error) {
      toast.error('Failed to upgrade subscription');
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks title="SubscriptionPlans — How it works" steps={[{title:"Open this tool",desc:"Access SubscriptionPlans within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Unlock powerful nutrition features to reach your goals faster
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">€{plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={subscription?.subscription_type === plan.id}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {subscription?.subscription_type === plan.id ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        All plans can be cancelled anytime. No hidden fees.
      </div>
    </div>
  );
}
