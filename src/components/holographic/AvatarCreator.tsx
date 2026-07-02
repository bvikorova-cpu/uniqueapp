import { useState } from "react";
import { ArrowLeft, Crown, Sparkles, Loader2, Palette, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const PERSONALITY_TRAITS = [
  "Bold", "Creative", "Wise", "Playful", "Mysterious", "Fierce",
  "Gentle", "Strategic", "Charismatic", "Rebellious", "Calm", "Energetic",
];

const AVATAR_STYLES = [
  { id: "cyber", name: "Cyberpunk", emoji: "🤖", desc: "Neon-lit digital warrior" },
  { id: "mystic", name: "Mystic", emoji: "🔮", desc: "Ancient ethereal being" },
  { id: "cosmic", name: "Cosmic", emoji: "🌌", desc: "Space-born entity" },
  { id: "nature", name: "Bio-Organic", emoji: "🌿", desc: "Living holographic flora" },
  { id: "crystal", name: "Crystal", emoji: "💎", desc: "Crystalline light form" },
  { id: "shadow", name: "Shadow", emoji: "🌑", desc: "Dark matter construct" },
];

export const AvatarCreator = ({ onBack }: Props) => {
  const [name, setName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : prev.length < 3 ? [...prev, trait] : prev
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || !selectedStyle || selectedTraits.length === 0) {
      toast({ title: "Missing Info", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-holographic-avatar-checkout", {
        body: { priceId: "price_1SPjFEGaXSfGtYFtBjeXRVkk", featureName: "Premium AI Avatar", metadata: { name, style: selectedStyle, traits: selectedTraits } },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        toast({ title: "Redirecting to Payment", description: "Complete payment to create your avatar" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to start creation", variant: "destructive" });
    } finally { setIsCreating(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Avatar Creator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Avatar Creator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Avatar Creator</h2>
          <p className="text-sm text-muted-foreground">Design your unique AI-powered holographic avatar</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-sm font-bold mb-2 block flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" /> Avatar Name</label>
            <Input placeholder="Enter avatar name..." value={name} onChange={e => setName(e.target.value)} className="text-lg" />
          </div>

          <div>
            <label className="text-sm font-bold mb-3 block flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Avatar Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVATAR_STYLES.map(style => (
                <motion.div key={style.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${selectedStyle === style.id ? "border-primary bg-primary/10 ring-2 ring-primary/40" : "border-border hover:border-primary/40"}`}>
                  <span className="text-3xl block mb-1">{style.emoji}</span>
                  <p className="font-bold text-sm">{style.name}</p>
                  <p className="text-xs text-muted-foreground">{style.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold mb-3 block flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Personality Traits (max 3)</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map(trait => (
                <motion.button key={trait} whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTraits.includes(trait) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"}`}>
                  {trait}
                </motion.button>
              ))}
            </div>
          </div>

          <Button onClick={handleCreate} disabled={isCreating || !name.trim() || !selectedStyle || selectedTraits.length === 0} className="w-full" size="lg">
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
            Create Avatar — €7/month
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-3">What You Get</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["AI personality that learns from interactions", "3D holographic rendering with animations", "Autonomous behavior — lives even when you're offline", "Daily evolution and personality development", "Battle arena access included", "Community interaction with other avatars"].map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm"><Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
