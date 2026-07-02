import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CRYSTAL_DATABASE } from "../crystalData";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalSubBoxTool = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<typeof CRYSTAL_DATABASE | null>(null);

  const generatePreview = () => {
    const shuffled = [...CRYSTAL_DATABASE].sort(() => Math.random() - 0.5);
    setPreview(shuffled.slice(0, 5));
  };

  const subscribe = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in to subscribe"); setLoading(false); return; }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: "crystal_sub_box",
          mode: "subscription",
          successUrl: `${window.location.origin}/crystal-energy-network?success=true`,
          cancelUrl: `${window.location.origin}/crystal-energy-network?canceled=true`,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else toast.error("Checkout not available yet. Please contact support.");
    } catch {
      toast.error("Subscription service is being set up. Please try again later.");
    }
    setLoading(false);
  };

  const features = [
    "AI-curated crystal selection based on your energy profile",
    "5 hand-picked crystals delivered monthly",
    "Information card for each crystal",
    "Exclusive rare & collector crystals",
    "Cancel anytime, no commitment",
    "Free shipping within EU",
  ];

  return (
    <>
      <FloatingHowItWorks title={"Crystal Sub Box Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Sub Box Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Sub Box Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Package className="w-5 h-5" /> Crystal Subscription Box
        </CardTitle>
        <p className="text-sm text-muted-foreground">Monthly AI-curated crystals delivered to your door</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <Package className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-3xl font-black text-primary mb-1">€29<span className="text-base font-medium text-muted-foreground">/month</span></h3>
          <p className="text-sm text-muted-foreground">5 AI-selected crystals • Free shipping • Cancel anytime</p>
        </div>

        <div className="space-y-2">
          {features.map(f => (
            <div key={f} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>

        <Button onClick={generatePreview} variant="outline" className="w-full gap-2">
          <Sparkles className="w-4 h-4" /> Preview Sample Box
        </Button>

        {preview && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold">Sample Box Preview</h4>
            <div className="grid gap-2">
              {preview.map(crystal => (
                <div key={crystal.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">💎</div>
                  <div>
                    <span className="text-sm font-semibold">{crystal.name}</span>
                    <p className="text-[10px] text-muted-foreground">{crystal.chakra} • {crystal.rarity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={subscribe} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          Subscribe Now — €29/month
        </Button>
      </CardContent>
    </Card>
    </>
  );
};
