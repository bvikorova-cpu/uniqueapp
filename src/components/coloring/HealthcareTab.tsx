import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Brain, Smile, Activity, Baby, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHealthcareSubscription } from "@/hooks/useHealthcareSubscription";
import { useNavigate } from "react-router-dom";

const basicPlans = [
  {
    id: "pediatric_mini",
    name: "Pediatric Mini",
    price: 3,
    icon: Baby,
    description: "For small practices (1-2 doctors)",
    features: [
      "50 downloads per month",
      "Basic child-friendly themes",
      "Print-ready PDF format",
      "Email support"
    ],
    priceId: "price_1SRv390QTWhd4oRpM8xbH4hm"
  },
  {
    id: "pediatric_standard",
    name: "Pediatric Standard",
    price: 5,
    icon: Smile,
    description: "Perfect for pediatricians",
    features: [
      "Unlimited downloads",
      "All child-friendly themes",
      "Anxiety-reducing content",
      "Monthly new additions",
      "Basic customization"
    ],
    priceId: "price_1SRv3SGaXSfGtYFtIxUFVzYa"
  },
  {
    id: "therapy_professional",
    name: "Art Therapy Professional",
    price: 15,
    icon: Brain,
    description: "For psychologists with multiple clients",
    features: [
      "Unlimited downloads",
      "Trauma-informed designs",
      "ADHD & autism specialized",
      "Session tracking (unlimited)",
      "Custom clinic branding",
      "Parent portal access",
      "Analytics dashboard"
    ],
    priceId: "price_1SRv4h0QTWhd4oRpv9tvXboN"
  },
  {
    id: "clinic_premium",
    name: "Clinic Premium",
    price: 25,
    icon: Building2,
    description: "Complete solution for clinics",
    features: [
      "Everything in Professional",
      "Multi-location support",
      "Staff accounts (up to 10)",
      "API integration",
      "EHR integration ready",
      "Custom content creation",
      "Tablet licenses (5 devices)",
      "Priority support"
    ],
    priceId: "price_1SRvD3GaXSfGtYFtlBnIKIq8"
  }
];

export function HealthcareTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscribed, subscription_tier, openCustomerPortal } = useHealthcareSubscription();

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-healthcare-subscription', {
        body: { priceId, planName }
      });

      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge className="mb-4" variant="secondary">
          <Heart className="w-4 h-4 mr-2" />
          For Healthcare & Therapy Professionals
        </Badge>
        <h2 className="text-4xl font-bold mb-4">Healthcare Coloring Solutions</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Therapeutic coloring pages designed to reduce anxiety and support mental health in clinical settings.
        </p>
        {subscribed && (
          <Button variant="outline" onClick={() => navigate('/healthcare-provider-dashboard')}>
            <Activity className="w-4 h-4 mr-2" />
            Go to Provider Dashboard
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {basicPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <plan.icon className="w-8 h-8 text-primary mb-2" />
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">€{plan.price}</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                className="w-full"
              >
                Subscribe
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
