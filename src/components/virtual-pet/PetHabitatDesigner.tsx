import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Loader2, Sparkles, TreePine } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const themes = ["Enchanted Forest", "Crystal Cave", "Tropical Paradise", "Volcano Lair", "Cloud Kingdom", "Underwater Palace", "Haunted Mansion", "Space Station", "Japanese Garden", "Arctic Tundra"];
const sizes = ["Cozy Nook (Small)", "Family Den (Medium)", "Royal Estate (Large)", "Epic Realm (Massive)"];
const species = ["Dog", "Cat", "Dragon", "Phoenix", "Unicorn", "Wolf", "Fox", "Rabbit", "Parrot", "Hamster"];

export const PetHabitatDesigner = ({ onBack }: Props) => {
  const [petName, setPetName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [theme, setTheme] = useState("");
  const [size, setSize] = useState("");
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits, useCredit } = useAICredits();

  const handleDesign = async () => {
    if (!selectedSpecies || !theme || !size) return toast.error("Fill in all fields");

    const hasCredits = await useCredit("custom_generation", "Habitat Designer");
    if (!hasCredits) return toast.error("Not enough credits! Purchase more to continue.");

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-habitat-designer", {
        body: { petName: petName || "My Pet", species: selectedSpecies, theme, size },
      });
      if (error) throw error;
      setDesign(data);
      toast.success("Habitat designed!");
    } catch (e: any) {
      toast.error(e.message || "Design failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
          <Home className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black">Pet Habitat Designer</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Create the perfect living space for your virtual pet. AI designs custom habitats with furniture, decorations, and species-specific features.
        </p>
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">5 Credits per design</span>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TreePine className="w-5 h-5" />Design Your Habitat</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Pet Name (optional)</label>
            <Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="e.g. Blaze" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Species</label>
            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
              <SelectTrigger><SelectValue placeholder="Select species..." /></SelectTrigger>
              <SelectContent>{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Theme</label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger><SelectValue placeholder="Choose a theme..." /></SelectTrigger>
              <SelectContent>{themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Size</label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger><SelectValue placeholder="Choose size..." /></SelectTrigger>
              <SelectContent>{sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={handleDesign} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Designing..." : "Generate Habitat Design"}
          </Button>
        </CardContent>
      </Card>

      {design && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Home className="w-5 h-5 text-primary" />{design.habitat_name}</h3>
              <p className="text-sm text-muted-foreground">{design.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {design.rooms?.map((room: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-background/80 border border-border/40">
                    <p className="text-xs font-bold">{room.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{room.description}</p>
                    <p className="text-[10px] text-primary mt-1">Bonus: {room.bonus}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                <p className="text-xs font-bold mb-1">🎨 Special Features</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {design.special_features?.map((f: string, i: number) => <li key={i}>• {f}</li>)}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-bold mb-1">⚡ Stat Boosts</p>
                <p className="text-[10px] text-muted-foreground">{design.stat_boosts}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
