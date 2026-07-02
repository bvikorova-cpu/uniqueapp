import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useEmployerPaymentStatus } from "@/hooks/useEmployerPaymentStatus";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SUBSCRIPTION_TIERS = [
  {
    name: "Basic",
    price: 49,
    priceId: "price_1SRO3r0QTWhd4oRpbItPTDme",
    productId: "prod_TOAOrEnRtpLdJq",
    icon: Zap,
    features: [
      "Unlimited job listings",
      "Basic support",
      "Job analytics",
      "Application management",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: 99,
    priceId: "price_1SRO4DGaXSfGtYFtfXevezC9",
    productId: "prod_TOAPUm5AolgpPh",
    icon: Crown,
    features: [
      "Everything in Basic",
      "Priority support",
      "Featured job listings",
      "Advanced analytics",
      "Custom branding",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    priceId: "price_1SRO4V0QTWhd4oRp6RSdSAWk",
    productId: "prod_TOAP0gwcYMZAV7",
    icon: Sparkles,
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "White-label solution",
      "SLA guarantee",
    ],
    popular: false,
  },
];

export function EmployerSubscriptionTiers() {
  const { subscribed, productId, subscriptionEnd, loading, createCheckout, manageSubscription } = useEmployerPaymentStatus();
  const { toast } = useToast();
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, tierName: string) => {
    try {
      setProcessingTier(tierName);
      await createCheckout(priceId);
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      console.error("Portal error:", error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCurrentTier = () => {
    return SUBSCRIPTION_TIERS.find(tier => tier.productId === productId);
  };

  const currentTier = getCurrentTier();

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Employer Subscription Tiers - How it works"} steps={[{ title: 'Open', desc: 'Access the Employer Subscription Tiers section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Employer Subscription Tiers.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscribed && currentTier && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <currentTier.icon className="h-5 w-5 text-primary" />
                  Current Plan: {currentTier.name}
                </CardTitle>
                <CardDescription>
                  {subscriptionEnd && (
                    <>Renews on {new Date(subscriptionEnd).toLocaleDateString()}</>
                  )}
                </CardDescription>
              </div>
              <Button onClick={handleManageSubscription} variant="outline">
                Manage Subscription
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Subscription Tiers */}
      <div className="grid md:grid-cols-3 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isCurrentTier = currentTier?.productId === tier.productId;
          
          return (
            <Card 
              key={tier.name} 
              className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''} ${isCurrentTier ? 'border-primary border-2' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              {isCurrentTier && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600">
                  Your Plan
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8 pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {!subscribed && (
                  <Button
                    onClick={() => handleSubscribe(tier.priceId, tier.name)}
                    disabled={processingTier === tier.name}
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {processingTier === tier.name ? "Processing..." : "Subscribe"}
                  </Button>
                )}
                
                {subscribed && !isCurrentTier && (
                  <Button
                    onClick={handleManageSubscription}
                    className="w-full"
                    variant="outline"
                  >
                    {currentTier && SUBSCRIPTION_TIERS.findIndex(t => t.productId === currentTier.productId) < SUBSCRIPTION_TIERS.findIndex(t => t.name === tier.name)
                      ? "Upgrade"
                      : "Downgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Benefits</CardTitle>
          <CardDescription>
            All plans include unlimited job listings and can be cancelled anytime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">No Hidden Fees</p>
              <p>Pay only the monthly subscription price</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Cancel Anytime</p>
              <p>No long-term commitments required</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Instant Access</p>
              <p>Start posting jobs immediately after subscribing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
