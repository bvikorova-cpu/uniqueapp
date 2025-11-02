import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Crown, Infinity } from "lucide-react";

const subscriptionTiers = [
  {
    name: "Free",
    price: "0",
    icon: Users,
    maxLives: 3,
    color: "text-gray-500",
    features: [
      "3 parallel lives",
      "Basic profile customization",
      "Standard posting",
      "Community access",
      "Cross-reality reveal: €4.99 each",
      "Reality merge: €9.99 each"
    ],
    popular: false
  },
  {
    name: "Premium",
    price: "7.99",
    icon: Crown,
    maxLives: 5,
    color: "text-yellow-500",
    features: [
      "5 parallel lives",
      "Advanced profile customization",
      "Priority posting",
      "Analytics dashboard",
      "10% discount on reveals & merges",
      "Exclusive community features",
      "Early access to new features"
    ],
    popular: true
  },
  {
    name: "Unlimited",
    price: "19.99",
    icon: Infinity,
    maxLives: 999,
    color: "text-purple-500",
    features: [
      "Unlimited parallel lives",
      "Premium profile themes",
      "Cross-reality analytics",
      "Bulk posting tools",
      "25% discount on reveals & merges",
      "VIP support",
      "Custom reality templates",
      "API access"
    ],
    popular: false
  }
];

export function ParallelSubscriptions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Reality Plan</CardTitle>
          <CardDescription>
            Select the perfect subscription for your parallel lives journey
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card 
              key={tier.name}
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
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
                <p className="text-sm text-muted-foreground mt-2">
                  Up to {tier.maxLives === 999 ? 'unlimited' : tier.maxLives} parallel lives
                </p>
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
                  disabled={tier.price === "0"}
                >
                  {tier.price === "0" ? "Current Plan" : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
          <CardDescription>Available for all plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cross-Reality Reveal</h4>
                <p className="text-sm text-muted-foreground">
                  €4.99 per reveal (discounts apply for premium tiers)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Reality Merge</h4>
                <p className="text-sm text-muted-foreground">
                  €9.99 per merge (discounts apply for premium tiers)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}