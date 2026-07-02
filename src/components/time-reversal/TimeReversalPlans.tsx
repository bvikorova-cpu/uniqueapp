import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Clock, Lock, Eye, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const PLANS = {
  timeSpeed: { name: "Time Travel Speed", price: "€6.99", priceId: "price_1SPitHGaXSfGtYFtD5qWM26P", icon: Zap, popular: false, description: "Age backwards faster than ever", features: ["2x faster aging reversal", "Custom speed settings", "Fast-forward through decades", "Priority timeline updates"] },
  ageLocks: { name: "Age Locks", price: "€4.99", priceId: "price_1SPitb0QTWhd4oRpSUpKFiYN", icon: Lock, popular: false, description: "Freeze time at your perfect age", features: ["Unlimited age lock points", "Pause at any age you want", "Create custom milestones", "Resume aging anytime"] },
  futureGlimpse: { name: "Future Glimpse", price: "€2.99", priceId: "price_1SPitv0QTWhd4oRpT3MCvpTR", icon: Eye, popular: false, description: "See your future self", features: ["Preview any future age", "AI-generated future photos", "Timeline exploration", "What-if scenarios"] },
  paradoxPosts: { name: "Time Paradox Posts", price: "€1.99", priceId: "price_1SPiuHGaXSfGtYFtJQmIpTBa", icon: Sparkles, popular: false, description: "Post across different timelines", features: ["Post from any age", "Create time paradoxes", "Cross-timeline content", "Special paradox badges"] },
  masterBundle: { name: "Time Master Bundle", price: "€12.99", priceId: "price_1SPiudGaXSfGtYFttW8NCjDx", icon: Clock, popular: true, description: "All features unlocked", features: ["All features included", "Exclusive Time Master badge", "Priority support", "Early access to new features", "Save €2 per month"] },
};

export function TimeReversalPlans({ onBack }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (planKey: keyof typeof PLANS) => {
    try {
      setLoading(planKey);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login Required", variant: "destructive" }); navigate("/auth"); return; }

      const plan = PLANS[planKey];
      const { data, error } = await supabase.functions.invoke("create-time-reversal-checkout", {
        body: { priceId: plan.priceId, featureName: plan.name },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to start payment.", variant: "destructive" });
    } finally { setLoading(null); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Time Reversal Plans'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Time Reversal Plans panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Plans & Pricing</h2>
          <p className="text-sm text-muted-foreground">Choose your time manipulation powers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
          const plan = PLANS[key];
          const Icon = plan.icon;
          return (
            <Card key={key} className={`relative ${plan.popular ? "border-purple-500 shadow-lg shadow-purple-500/20 md:col-span-2 lg:col-span-3" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-semibold">Best Value</span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-7 w-7 text-purple-500" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{plan.price}</div>
                    <div className="text-xs text-muted-foreground">/month</div>
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" /><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} onClick={() => handleSubscribe(key)} disabled={loading === key}>
                  {loading === key ? "Loading..." : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
}
