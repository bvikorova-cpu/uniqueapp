import { useState } from "react";
import { ArrowLeft, Heart, Dna, Sparkles, Loader2, Baby, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const SAMPLE_AVATARS = [
  { id: 1, name: "NeonWraith", style: "Cyberpunk", traits: ["Bold", "Strategic", "Fierce"], level: 42 },
  { id: 2, name: "CrystalSage", style: "Crystal", traits: ["Wise", "Calm", "Creative"], level: 38 },
  { id: 3, name: "ShadowKing", style: "Shadow", traits: ["Mysterious", "Strategic", "Rebellious"], level: 51 },
  { id: 4, name: "CosmicVoid", style: "Cosmic", traits: ["Charismatic", "Energetic", "Playful"], level: 35 },
];

export const AvatarBreeding = ({ onBack }: Props) => {
  const [parent1, setParent1] = useState<number | null>(null);
  const [parent2, setParent2] = useState<number | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const { toast } = useToast();

  const handleBreed = async () => {
    if (parent1 === null || parent2 === null) {
      toast({ title: "Select Both Parents", description: "Choose two avatars to breed", variant: "destructive" });
      return;
    }
    setIsBreeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-holographic-avatar-checkout", {
        body: { priceId: "price_1SPjGzGaXSfGtYFtTGxQm0hM", featureName: "Avatar Breeding", metadata: { parent1, parent2 } },
      });
      if (error) throw error;
      if (data?.url) {
        try { localStorage.setItem("pendingHoloAction", JSON.stringify({ kind: "breeding", parent1, parent2 })); } catch {}
        window.open(data.url, "_blank");
        toast({ title: "Breeding Started!", description: "Complete payment to breed your avatars" });
      }
    } catch { toast({ title: "Error", description: "Failed to start breeding", variant: "destructive" }); }
    finally { setIsBreeding(false); }
  };

  return (
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

          <Button onClick={handleBreed} disabled={isBreeding || parent1 === null || parent2 === null} className="w-full" size="lg">
            {isBreeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Baby className="w-4 h-4 mr-2" />}
            Breed Avatars — €10
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
  );
};
