import { useState } from "react";
import { ArrowLeft, Heart, Dna, Sparkles, Loader2, Baby, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useHolographicCredits, HOLO_COSTS } from "@/hooks/useHolographicCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const SAMPLE_AVATARS = [
  { id: 1, name: "NeonWraith", style: "Cyberpunk", traits: ["Bold", "Strategic", "Fierce"], level: 42 },
  { id: 2, name: "CrystalSage", style: "Crystal", traits: ["Wise", "Calm", "Creative"], level: 38 },
  { id: 3, name: "ShadowKing", style: "Shadow", traits: ["Mysterious", "Strategic", "Rebellious"], level: 51 },
  { id: 4, name: "CosmicVoid", style: "Cosmic", traits: ["Charismatic", "Energetic", "Playful"], level: 35 },
];

interface Offspring {
  offspring_name: string;
  offspring_style: string;
  offspring_traits: string[] | null;
  offspring_level: number | null;
  rarity: string | null;
}

const RARITY_STYLES: Record<string, string> = {
  common: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  rare: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  epic: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  legendary: "bg-amber-500/15 text-amber-600 border-amber-500/30",
};

export const AvatarBreeding = ({ onBack }: Props) => {
  const [parent1, setParent1] = useState<number | null>(null);
  const [parent2, setParent2] = useState<number | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [offspring, setOffspring] = useState<Offspring | null>(null);
  const [offspringImage, setOffspringImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const { toast } = useToast();
  const { balance, spend, refresh } = useHolographicCredits();

  const handleBreed = async () => {
    if (parent1 === null || parent2 === null) {
      toast({ title: "Select Both Parents", description: "Choose two avatars to breed", variant: "destructive" });
      return;
    }
    setIsBreeding(true);
    setOffspring(null);
    setOffspringImage(null);
    try {
      const paid = await spend(HOLO_COSTS.breeding, "breeding");
      if (!paid) return;
      const { data, error } = await supabase.functions.invoke("holographic-breeding-simulate", {
        body: { parent1, parent2 } });
      if (error) throw error;
      const r = data?.result as Offspring | undefined;
      if (r) {
        setOffspring(r);
        await refresh();
        setImageLoading(true);
        try {
          const { data: img } = await supabase.functions.invoke("holographic-avatar-image", {
            body: { name: r.offspring_name, style: r.offspring_style, traits: r.offspring_traits ?? [] } });
          const url = img?.imageUrl || img?.image || img?.url;
          if (url) setOffspringImage(url);
        } catch { /* image is optional */ }
        finally { setImageLoading(false); }
      } else {
        toast({ title: "Breeding complete", description: `${HOLO_COSTS.breeding} credits used.` });
      }
    } catch { toast({ title: "Error", description: "Failed to breed avatars", variant: "destructive" }); }
    finally { setIsBreeding(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Avatar Breeding'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Avatar Breeding panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Avatar Breeding</h2>
          <p className="text-sm text-muted-foreground">Combine two avatars to create unique offspring</p>
        </div>
      </div>

      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-background">
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Dna className="w-5 h-5 text-pink-500" /> Select Parents</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Parent 1 */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Parent 1</p>
              <div className="space-y-2">
                {SAMPLE_AVATARS.map(a => (
                  <motion.div key={a.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setParent1(a.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${parent1 === a.id ? "border-pink-500 bg-pink-500/10" : "border-border hover:border-pink-500/40"}`}>
                    <p className="font-bold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.style} • Lv.{a.level}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Parent 2 */}
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Parent 2</p>
              <div className="space-y-2">
                {SAMPLE_AVATARS.filter(a => a.id !== parent1).map(a => (
                  <motion.div key={a.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setParent2(a.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${parent2 === a.id ? "border-pink-500 bg-pink-500/10" : "border-border hover:border-pink-500/40"}`}>
                    <p className="font-bold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.style} • Lv.{a.level}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {parent1 !== null && parent2 !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-cyan-500/10 border border-pink-500/20 mb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="font-bold text-sm">{SAMPLE_AVATARS.find(a => a.id === parent1)?.name}</span>
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="font-bold text-sm">{SAMPLE_AVATARS.find(a => a.id === parent2)?.name}</span>
              </div>
              <p className="text-xs text-center text-muted-foreground">Potential traits: Combined genetics from both parents</p>
            </motion.div>
          )}

          <p className="text-xs text-muted-foreground text-center mb-3">Your balance: <strong className="text-foreground">{balance} credits</strong></p>

          <Button onClick={handleBreed} disabled={isBreeding || parent1 === null || parent2 === null} className="w-full" size="lg">
            {isBreeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Baby className="w-4 h-4 mr-2" />}
            {`Breed Avatars — ${HOLO_COSTS.breeding} credits`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-3">How Breeding Works</h3>
          <div className="space-y-3 text-sm">
            {["Each offspring inherits random traits from both parents", "Rare trait combinations can produce Legendary avatars", "Bred avatars start at Level 1 but may have higher base stats", "Each breeding pair can only produce 3 offspring total", "Offspring can be traded on the marketplace"].map((f, i) => (
              <div key={i} className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
