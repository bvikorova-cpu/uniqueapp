import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Brain, Smile, Activity, Baby, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHealthcareSubscription } from "@/hooks/useHealthcareSubscription";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const basicPlans = [
  { id: "pediatric_mini", name: "Pediatric Mini", price: 3, icon: Baby, description: "For small practices (1-2 doctors)", features: ["50 downloads per month", "Basic child-friendly themes", "Print-ready PDF format", "Email support"], priceId: "price_1TlWB3GaXSfGtYFtwmGHpzLV" },
  { id: "pediatric_standard", name: "Pediatric Standard", price: 5, icon: Smile, description: "Perfect for pediatricians", features: ["Unlimited downloads", "All child-friendly themes", "Anxiety-reducing content", "Monthly new additions", "Basic customization"], priceId: "price_1TlWB4GaXSfGtYFtFc4g2deu" },
  { id: "therapy_professional", name: "Art Therapy Professional", price: 15, icon: Brain, description: "For psychologists with multiple clients", features: ["Unlimited downloads", "Trauma-informed designs", "ADHD & autism specialized", "Session tracking (unlimited)", "Custom clinic branding", "Parent portal access", "Analytics dashboard"], priceId: "price_1TlWB4GaXSfGtYFtNjWmwe9X" },
  { id: "clinic_premium", name: "Clinic Premium", price: 25, icon: Building2, description: "Complete solution for clinics", features: ["Everything in Professional", "Multi-location support", "Staff accounts (up to 10)", "API integration", "EHR integration ready", "Custom content creation", "Tablet licenses (5 devices)", "Priority support"], priceId: "price_1TlWB5GaXSfGtYFthkRtD9Jx" },
];

export function HealthcareTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscribed, subscription_tier, openCustomerPortal } = useHealthcareSubscription();

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication Required", description: "Please sign in to subscribe", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke('create-healthcare-subscription', { body: { priceId, planName } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast({ title: "Error", description: "Failed to create checkout session", variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Healthcare Tab - How it works"} steps={[{ title: 'Open', desc: 'Access the Healthcare Tab section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Healthcare Tab.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Badge className="mb-4" variant="secondary"><Heart className="w-4 h-4 mr-2" />For Healthcare & Therapy Professionals</Badge>
        <h2 className="text-4xl font-bold mb-4">Healthcare Coloring Solutions</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Therapeutic coloring pages designed to reduce anxiety and support mental health in clinical settings.
        </p>
        {subscribed && (
          <Button variant="outline" onClick={() => navigate('/healthcare-provider-dashboard')}>
            <Activity className="w-4 h-4 mr-2" /> Go to Provider Dashboard
          </Button>
        )}
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {basicPlans.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`backdrop-blur-xl bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-1 ${
              plan.id === "therapy_professional" ? "border-2 border-primary" : "border-border/30 hover:border-primary/30"
            }`}>
              <CardHeader>
                {plan.id === "therapy_professional" && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">€{plan.price}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSubscribe(plan.priceId, plan.name)} className="w-full">Subscribe</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
