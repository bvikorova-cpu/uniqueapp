import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ModuleSubscriptionHero } from "@/components/subscription/ModuleSubscriptionHero";

const HomeDecorSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => { loadSubscription(); }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setInitialLoading(false); return; }
      const { data } = await supabase.from('decor_subscriptions').select('*').eq('user_id', user.id).maybeSingle();
      setCurrentSubscription(data);
    } catch (e) {
      console.warn('loadSubscription failed', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubscribe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-decor-checkout');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create checkout", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const plan = {
    tier: 'pro', name: 'Pro Designer', price: 9.99, designs: 50,
    features: [
      '50 AI room designs per month',
      'Color Palette Generator (8 credits)',
      'Furniture Recommender (10 credits)',
      'Virtual Room Staging (12 credits)',
      'All styles & customization',
      'Detailed product suggestions',
      'Unlimited saved projects',
      'AR preview (€0.99/preview)',
      'Priority support',
      'Export to PDF'
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <ModuleSubscriptionHero
          module="Home Decor Studio"
          icon={Home}
          badge="AI designer"
          title="Pro Designer Plan"
          subtitle="Unlock the full power of AI-driven interior design — unlimited rooms, palettes and staging."
        />

        {currentSubscription && (
          <Card className="mb-8 bg-gradient-subtle">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Current Plan</p>
                  <p className="text-2xl font-bold capitalize">{currentSubscription.tier}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentSubscription.designs_used}/{currentSubscription.designs_limit} designs used
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="max-w-2xl mx-auto">
          <Card className="border-primary border-2 relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg">
              <Sparkles className="h-4 w-4 inline mr-1" /> Recommended
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.designs} AI designs / month</CardDescription>
                </div>
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-4">
                <span className="text-5xl font-bold">€{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleSubscribe} className="w-full" size="lg"
                disabled={loading || currentSubscription?.tier === 'pro'}>
                {loading ? "Loading..." : currentSubscription?.tier === 'pro' ? "Active Plan" : "Activate Pro Designer"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AR Try-Before-Buy</CardTitle>
              <CardDescription>Preview furniture in your room with augmented reality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg px-3 py-1">€0.99 / preview</Badge>
                <Button variant="outline" onClick={() => navigate("/home-designer")}>Try AR</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Design Consultations</CardTitle>
              <CardDescription>Video call with a professional interior designer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg px-3 py-1">€29-€49</Badge>
                <Button variant="outline" onClick={() => navigate("/home-designer")}>Book Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeDecorSubscription;
