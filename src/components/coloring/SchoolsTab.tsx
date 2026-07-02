import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, School, Users, Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SCHOOL_TIERS = [
  { id: "kindergarten", name: "Kindergarten Starter", price: 5, description: "Perfect for preschools and kindergartens", features: ["100 coloring pages per month", "Basic themes (animals, seasons, colors)", "PDF export with school logo", "Single teacher account", "Email support"], icon: School, popular: false },
  { id: "elementary", name: "Elementary Standard", price: 15, description: "Ideal for primary schools", features: ["Unlimited coloring pages", "All subjects (math, science, language)", "Bulk download (ZIP packages)", "School logo + custom branding", "Up to 5 teacher accounts", "Progress tracking", "Priority support"], icon: BookOpen, popular: true },
  { id: "premium", name: "School Premium", price: 25, description: "Complete solution for modern schools", features: ["Everything in Standard +", "Custom AI-generated pages", "Worksheet generator", "Up to 15 teacher accounts", "Analytics dashboard", "Lesson plan integration", "White-label options", "Dedicated support"], icon: Sparkles, popular: false },
];

export function SchoolsTab() {
  const [loading, setLoading] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const handleSubscribe = async (tierId: string) => {
    if (isAdmin) {
      toast.success("Admin access - redirecting to dashboard");
      navigate('/teacher-dashboard');
      return;
    }
    try {
      setLoading(tierId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to subscribe"); return; }
      const { data, error } = await supabase.functions.invoke("create-school-subscription", { body: { tier: tierId } });
      if (error) throw error;
      if (data?.url) { window.open(data.url, '_blank'); toast.success("Opening checkout..."); }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to create subscription");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Schools Tab - How it works"} steps={[{ title: 'Open', desc: 'Access the Schools Tab section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Schools Tab.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Badge className="mb-4" variant="secondary"><School className="w-4 h-4 mr-2" />For Schools & Educational Institutions</Badge>
        <h2 className="text-4xl font-bold mb-4">Educational Coloring Pages</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Empower your students with AI-generated educational coloring pages. Perfect for schools, kindergartens, and educational institutions.
        </p>
        <Button variant="outline" onClick={() => navigate('/teacher-dashboard')}>
          <Users className="w-4 h-4 mr-2" /> Go to Teacher Dashboard
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {SCHOOL_TIERS.map((tier, i) => (
          <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`backdrop-blur-xl bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-1 ${
              tier.popular ? "border-2 border-primary" : "border-border/30 hover:border-primary/30"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <tier.icon className="w-5 h-5 text-primary" />
                  </div>
                  {tier.popular && <Badge variant="default">Popular</Badge>}
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">€{tier.price}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSubscribe(tier.id)} disabled={loading === tier.id || adminLoading} className="w-full">
                  {loading === tier.id ? "Processing..." : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
