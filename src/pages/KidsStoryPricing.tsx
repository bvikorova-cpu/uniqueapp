import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, Crown, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const KidsStoryPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = async (tier: 'monthly' | 'annual') => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-kids-story-subscription-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error("Failed to start subscription process");
    }
  };

  const plans = [
    {
      name: "Free",
      price: "€0",
      period: "forever",
      description: "Try it out",
      features: [
        "1 story per month",
        "AI-generated illustrations",
        "Basic story themes",
      ],
      limitations: [
        "No story library",
        "No PDF export",
        "Limited to 1 story/month"
      ],
      cta: "Current Plan",
      onClick: () => navigate("/kids-story-creator"),
      variant: "outline" as const,
    },
    {
      name: "Monthly Premium",
      price: "€5",
      period: "per month",
      description: "Perfect for regular storytelling",
      features: [
        "Unlimited stories",
        "AI-generated illustrations",
        "All story themes & characters",
        "Story library access",
        "PDF export with illustrations",
        "Priority AI processing",
      ],
      popular: true,
      cta: "Start Monthly",
      onClick: () => handleSubscribe('monthly'),
      variant: "default" as const,
    },
    {
      name: "Annual Premium",
      price: "€50",
      period: "per year",
      description: "Best value - Save €10",
      features: [
        "Unlimited stories",
        "AI-generated illustrations",
        "All story themes & characters",
        "Story library access",
        "PDF export with illustrations",
        "Priority AI processing",
        "2 months free!",
      ],
      cta: "Start Annual",
      onClick: () => handleSubscribe('annual'),
      variant: "default" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground text-lg">
              Create unlimited magical stories for your children
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.limitations && (
                    <ul className="space-y-2 pt-2 border-t">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-xs">✗</span>
                          <span className="text-xs">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    onClick={plan.onClick}
                    variant={plan.variant}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                What You Get with Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <BookOpen className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Unlimited Creativity</h3>
                  <p className="text-sm text-muted-foreground">
                    Create as many stories as you want, anytime
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Crown className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Story Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Save and organize all your created stories
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">PDF Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Download beautiful PDFs with illustrations
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Priority Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Faster story generation for premium members
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default KidsStoryPricing;
