import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Zap, Check, Crown, Globe, Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MultiversePricingProps {
  onBack: () => void;
}

const services = [
  {
    id: "universe_creation",
    title: "Universe Creation",
    description: "Create custom parallel universes with AI",
    price: "€49",
    priceType: "one-time",
    icon: Globe,
    features: ["AI-generated alternate realities", "Custom universe parameters", "Infinite parallel versions", "Reality snapshot system", "Universe analytics"],
    color: "violet",
  },
  {
    id: "reality_jumping",
    title: "Reality Jumping",
    description: "Jump between alternate realities",
    price: "€59",
    priceType: "/month",
    icon: Sparkles,
    features: ["Unlimited reality jumps", "Cross-dimensional navigation", "Life path exploration", "Decision tree mapping", "Probability analysis"],
    color: "red",
    popular: true,
  },
  {
    id: "timeline_merging",
    title: "Timeline Merging",
    description: "Merge timelines into optimal reality",
    price: "€79",
    priceType: "one-time",
    icon: Layers,
    features: ["Multi-timeline integration", "Optimized path selection", "Quantum entanglement sync", "Reality harmonization", "Convergence analytics"],
    color: "blue",
  },
  {
    id: "best_self_selection",
    title: "Best Self Selection",
    description: "AI finds your most successful versions",
    price: "€99",
    priceType: "/month",
    icon: Crown,
    features: ["AI success metrics analysis", "Cross-universe comparison", "Peak performance tracking", "Optimal trait identification", "Version recommendation"],
    color: "amber",
    popular: true,
  },
];

const MultiversePricing = ({ onBack }: MultiversePricingProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (serviceType: string) => {
    try {
      setLoading(serviceType);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke('create-multiverse-checkout', { body: { serviceType } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e) {
      toast({ title: "Error", description: "Failed to process. Try again.", variant: "destructive" });
    } finally { setLoading(null); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Multiverse Pricing'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Multiverse Pricing panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub</Button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Multiverse Access Plans</h2>
        <p className="text-muted-foreground mt-2">Choose your path through infinite realities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className={`relative overflow-hidden border-${s.color}-500/20 hover:border-${s.color}-500/40 transition-all hover:scale-[1.02]`}>
              {s.popular && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-xs"><Zap className="w-3 h-3 mr-1" />Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-2"><Icon className="w-6 h-6 text-primary" /></div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription className="text-xs">{s.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">{s.price}</span>
                  <span className="text-xs text-muted-foreground">{s.priceType}</span>
                </div>
                <ul className="space-y-1.5">
                  {s.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="w-3 h-3 text-primary flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button onClick={() => handlePurchase(s.id)} disabled={loading === s.id} className="w-full" variant={s.popular ? "default" : "outline"}>
                  {loading === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Access"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default MultiversePricing;
