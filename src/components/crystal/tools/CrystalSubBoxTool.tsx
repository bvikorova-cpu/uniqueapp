import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle2, Sparkles, Loader2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CRYSTAL_DATABASE } from "../crystalData";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const BOX_COST = 15;

export const CrystalSubBoxTool = () => {
  const [loading, setLoading] = useState(false);
  const [box, setBox] = useState<typeof CRYSTAL_DATABASE | null>(null);
  const [preview, setPreview] = useState<typeof CRYSTAL_DATABASE | null>(null);

  const generatePreview = () => {
    const shuffled = [...CRYSTAL_DATABASE].sort(() => Math.random() - 0.5);
    setPreview(shuffled.slice(0, 5));
  };

  const curateBox = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in to curate your box"); setLoading(false); return; }
    try {
      const { error } = await (supabase as any).rpc("deduct_ai_credits_atomic", {
        _user_id: session.user.id,
        _amount: BOX_COST,
      });
      if (error) {
        const msg = error.message || "";
        toast.error(msg.includes("INSUFFICIENT_CREDITS") ? `You need ${BOX_COST} credits for a curated box` : "Could not deduct credits");
        setLoading(false);
        return;
      }
      const shuffled = [...CRYSTAL_DATABASE].sort(() => Math.random() - 0.5);
      setBox(shuffled.slice(0, 5));
      toast.success(`Box curated — ${BOX_COST} credits used`);
    } catch {
      toast.error("Curation failed. Please try again.");
    }
    setLoading(false);
  };

  const features = [
    "AI-curated crystal selection based on your energy profile",
    "5 hand-picked crystals per box",
    "Purpose, chakra and rarity details for each crystal",
    "Includes rare & collector crystals",
    "Pay with credits — no subscription, no commitment",
    "Curate a new box whenever you want",
  ];

  return (
    <>
      <FloatingHowItWorks title={"Crystal Box Curation - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Box Curation section from its module.' }, { title: 'Preview', desc: 'Generate a free sample box to see the format.' }, { title: 'Curate', desc: `Spend ${BOX_COST} credits to curate your personal box.` }, { title: 'Review', desc: 'Read your 5 crystals with chakra and rarity details.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Package className="w-5 h-5" /> AI Crystal Box Curation
        </CardTitle>
        <p className="text-sm text-muted-foreground">AI-curated crystal box — paid with credits</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <Package className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-3xl font-black text-primary mb-1 flex items-center justify-center gap-2">
            <Coins className="w-6 h-6" /> {BOX_COST}<span className="text-base font-medium text-muted-foreground">credits</span>
          </h3>
          <p className="text-sm text-muted-foreground">5 AI-selected crystals • No subscription • Curate anytime</p>
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
          <Sparkles className="w-4 h-4" /> Preview Sample Box (free)
        </Button>

        {(box || preview) && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold">{box ? "Your Curated Box" : "Sample Box Preview"}</h4>
            <div className="grid gap-2">
              {(box || preview)!.map(crystal => (
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

        <Button onClick={curateBox} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          Curate My Box — {BOX_COST} credits
        </Button>
      </CardContent>
    </Card>
    </>
  );
};
