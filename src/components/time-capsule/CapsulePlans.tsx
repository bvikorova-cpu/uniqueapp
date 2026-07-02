import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Check, Clock, Sparkles, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const PLANS = [
  { key: "oneYear", name: "1 Year Capsule", price: "€4.99", priceId: "price_1SQAOcGaXSfGtYFtunvQGLzb", icon: Clock, popular: false, type: "one-time", features: ["Text, video, or letter format", "Automatic delivery in 1 year", "Email notifications", "Secure encrypted storage"] },
  { key: "fiveYears", name: "5 Years Capsule", price: "€9.99", priceId: "price_1SQAOwGaXSfGtYFtn0rkkTSB", icon: Clock, popular: true, type: "one-time", features: ["All formats supported", "Delivery in 5 years", "Priority storage", "HD video support (up to 500MB)"] },
  { key: "tenYears", name: "10 Years Capsule", price: "€19.99", priceId: "price_1SQAPFGaXSfGtYFtSHQvDsqK", icon: Clock, popular: false, type: "one-time", features: ["All formats + attachments", "Delivery in 10 years", "Premium storage", "HD video support (up to 1GB)"] },
  { key: "twentyYears", name: "20 Years Capsule", price: "€49.99", priceId: "price_1SQAPXGaXSfGtYFtLUC7c9DS", icon: Sparkles, popular: false, type: "one-time", features: ["Unlimited formats & files", "Delivery in 20 years", "Lifetime storage guarantee", "4K video support (up to 5GB)"] },
  { key: "premium", name: "Premium Unlimited", price: "€19.99/mo", priceId: "price_1SQAPtGaXSfGtYFtuhuiyuUV", icon: Shield, popular: false, type: "subscription", features: ["Unlimited time capsules", "Any delivery date", "Priority support 24/7", "Advanced scheduling & reminders", "Cancel anytime"] },
];

export const CapsulePlans = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (plan: typeof PLANS[0]) => {
    try {
      setLoading(plan.key);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login Required", variant: "destructive" }); return; }

      const fnName = plan.type === "subscription" ? "create-time-capsule-premium-subscription" : "create-time-capsule-payment";
      const body = plan.type === "subscription" ? {} : { priceId: plan.priceId, durationYears: plan.key === "oneYear" ? 1 : plan.key === "fiveYears" ? 5 : plan.key === "tenYears" ? 10 : 20 };
      const { data, error } = await supabase.functions.invoke(fnName, { body });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(null); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Capsule Plans'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Capsule Plans panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Capsule Plans & Pricing
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANS.map((plan, i) => (
          <motion.div key={plan.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`relative h-full ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/40'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-bold">Most Popular</span>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <plan.icon className="h-6 w-6 text-primary" />
                  <div className="text-right">
                    <div className="text-2xl font-black">{plan.price}</div>
                    <div className="text-[10px] text-muted-foreground">{plan.type}</div>
                  </div>
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} onClick={() => handlePurchase(plan)} disabled={loading === plan.key}>
                  {loading === plan.key ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.type === "subscription" ? "Subscribe" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
