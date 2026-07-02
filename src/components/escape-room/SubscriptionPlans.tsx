import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SubscriptionPlans = () => {
  const plans = [
    {
      name: "Premium",
      price: 10,
      period: "month",
      description: "For serious escape room enthusiasts",
      features: [
        "Play all escape rooms",
        "Advanced puzzle creator",
        "AI-generated puzzles",
        "Custom graphics",
        "Unlimited hints",
        "Priority support",
        "Create unlimited rooms",
        "Earn 70% from your rooms"
      ],
      icon: Crown,
      color: "text-yellow-500",
      popular: true
    },
    {
      name: "Educational",
      price: 20,
      period: "month per class",
      description: "Perfect for schools and teachers",
      features: [
        "All premium features",
        "Educational puzzle templates",
        "Student progress tracking",
        "Curriculum-aligned content",
        "Bulk class access",
        "Teacher dashboard",
        "Safe environment"
      ],
      icon: Sparkles,
      color: "text-blue-500"
    }
  ];

  return (
    <>
      <FloatingHowItWorks title={"Subscription Plans - How it works"} steps={[{ title: 'Open', desc: 'Access the Subscription Plans section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Subscription Plans.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="text-center">
        <div className="h-20" />
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground mb-2">
          Unlock advanced features and start creating your own escape rooms
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Premium plans give you unlimited access to all rooms, AI puzzle generation, advanced creator tools, and the ability to earn from your published rooms. Educational plans include everything in Premium plus classroom management, student progress tracking, and curriculum-aligned content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <div className="h-32" />
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`h-6 w-6 ${plan.color}`} />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                 onClick={async () => {
                   try {
                     const { supabase } = await import("@/integrations/supabase/client");
                     const { data: { session } } = await supabase.auth.getSession();
                     if (!session) { toast.error("Please log in first"); return; }
                     const { data, error } = await supabase.functions.invoke("create-checkout", {
                       body: {
                         product: "escape_room_subscription",
                         productName: `Escape Room ${plan.name} Plan`,
                         amount: Math.round(plan.price * 100),
                         mode: "subscription",
                         metadata: { plan_name: plan.name, interval: plan.period },
                       }
                     });
                     if (error) throw error;
                     if (data?.url) window.open(data.url, "_blank");
                   } catch (e: any) { toast.error(e.message || "Checkout zlyhal"); }
                 }}>
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-subtle">
        <CardHeader>
          <div className="h-24" />
          <CardTitle>Creator Earnings</CardTitle>
          <CardDescription>
            Make money by creating escape rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">70%</div>
              <p className="text-sm text-muted-foreground">Your earnings per play</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">30%</div>
              <p className="text-sm text-muted-foreground">Platform fee</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Unlimited</div>
              <p className="text-sm text-muted-foreground">Earning potential</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default SubscriptionPlans;
