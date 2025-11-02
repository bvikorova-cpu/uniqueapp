import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";

const subscriptionTiers = [
  {
    name: "Basic Clone",
    price: "9.99",
    icon: Zap,
    color: "text-blue-500",
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
    icon: Star,
    color: "text-purple-500",
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
    price: "99-499",
    icon: Crown,
    color: "text-yellow-500",
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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Clone Subscription</CardTitle>
          <CardDescription>
            Select the perfect plan for your AI personality clone needs
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
                >
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Clone-to-Clone Dating</h4>
                <p className="text-sm text-muted-foreground">€4.99 per session</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border rounded-lg">
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
  );
}