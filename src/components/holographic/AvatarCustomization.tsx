import { useState } from "react";
import { ArrowLeft, Palette, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const PACKS = [
  {
    id: "basic", name: "Basic Pack", price: "€3", priceId: "price_1SPjFUGaXSfGtYFtNiiQEQcT",
    features: ["20+ appearance options", "Basic clothing items", "5 personality traits", "Name customization"], color: "border-blue-500/30",
  },
  {
    id: "advanced", name: "Advanced Pack", price: "€15", priceId: "price_1SPjFk0QTWhd4oRpZGc4FevP", popular: true,
    features: ["200+ appearance options", "Premium clothing & accessories", "20+ personality traits", "Custom animations", "Voice customization", "Exclusive visual effects"], color: "border-primary/40",
  },
];

export const AvatarCustomization = ({ onBack }: Props) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (pack: typeof PACKS[0]) => {
    setLoading(pack.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-holographic-avatar-checkout", {
        body: { priceId: pack.priceId, featureName: pack.name },
      });
      if (error) throw error;
      if (data?.url) { window.open(data.url, "_blank"); }
    } catch { toast({ title: "Error", description: "Failed to start purchase", variant: "destructive" }); }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PACKS.map((pack, i) => (
          <motion.div key={pack.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`relative ${pack.color} ${pack.popular ? "ring-2 ring-primary/30" : ""}`}>
              {pack.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{pack.price}</div>
                    <div className="text-xs text-muted-foreground">one-time</div>
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
