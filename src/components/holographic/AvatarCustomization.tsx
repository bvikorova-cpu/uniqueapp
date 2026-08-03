import { useState } from "react";
import { ArrowLeft, Palette, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useHolographicCredits, HOLO_COSTS } from "@/hooks/useHolographicCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const PACKS = [
  { id: "basic", name: "Basic Pack", cost: HOLO_COSTS.pack_basic,
    features: ["20+ appearance options", "Basic clothing items", "5 personality traits", "Name customization"], color: "border-blue-500/30" },
  { id: "advanced", name: "Advanced Pack", cost: HOLO_COSTS.pack_advanced, popular: true,
    features: ["200+ appearance options", "Premium clothing & accessories", "20+ personality traits", "Custom animations", "Voice customization", "Exclusive visual effects"], color: "border-primary/40" },
];

export const AvatarCustomization = ({ onBack }: Props) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { balance, spend } = useHolographicCredits();

  const handlePurchase = async (pack: typeof PACKS[0]) => {
    setLoading(pack.id);
    try {
      const paid = await spend(pack.cost, `pack_${pack.id}`);
      if (!paid) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("holographic_purchases").insert({
          user_id: user.id,
          service_type: `pack_${pack.id}`,
          amount: pack.cost,
          status: "completed",
          metadata: { pack: pack.name, paid_with: "credits" },
        } as any);
      }
      toast({ title: "Pack unlocked!", description: `${pack.name} activated — ${pack.cost} credits used.` });
    } catch { toast({ title: "Error", description: "Failed to unlock pack", variant: "destructive" }); }
    finally { setLoading(null); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Avatar Customization'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Avatar Customization panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Customization Packs</h2>
          <p className="text-sm text-muted-foreground">Unlock appearance options and personality traits</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Your balance: <strong className="text-foreground">{balance} credits</strong></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PACKS.map((pack, i) => (
          <motion.div key={pack.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`relative ${pack.color} ${pack.popular ? "ring-2 ring-primary/30" : ""}`}>
              {pack.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{pack.cost}</div>
                    <div className="text-xs text-muted-foreground">credits</div>
                  </div>
                </div>
                <h3 className="text-xl font-black mb-2">{pack.name}</h3>
                <ul className="space-y-2 mb-6">
                  {pack.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handlePurchase(pack)} disabled={loading === pack.id} className="w-full" size="lg" variant={pack.popular ? "default" : "outline"}>
                  {loading === pack.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />} Purchase
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
