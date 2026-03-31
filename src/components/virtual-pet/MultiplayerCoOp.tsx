import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Loader2, Swords, Shield, Map } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const dungeons = [
  { id: "crystal_caves", name: "Crystal Caves", difficulty: "Easy", reward: "50-100 XP", icon: "💎" },
  { id: "shadow_forest", name: "Shadow Forest", difficulty: "Medium", reward: "100-200 XP", icon: "🌲" },
  { id: "dragon_peak", name: "Dragon's Peak", difficulty: "Hard", reward: "200-500 XP", icon: "🐉" },
  { id: "void_realm", name: "Void Realm", difficulty: "Legendary", reward: "500-1000 XP", icon: "🌌" },
];

export const MultiplayerCoOp = ({ onBack }: Props) => {
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [dungeon, setDungeon] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { credits, useCredit } = useAICredits();

  const { data: pets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const togglePet = (id: string) => {
    setSelectedPetIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const startDungeon = async () => {
    if (selectedPetIds.length < 2) return toast.error("Select at least 2 pets for co-op");
    if (!dungeon) return toast.error("Pick a dungeon");
    if (credits.credits_remaining < 6) return toast.error("Not enough credits (6 required)");

    setLoading(true);
    try {
      const team = pets?.filter(p => selectedPetIds.includes(p.id)).map(p => ({
        name: p.name, species: p.pet_types?.species, level: p.level, happiness: p.happiness, energy: p.energy
      }));
      const d = dungeons.find(dd => dd.id === dungeon);
      const { data, error } = await supabase.functions.invoke('pet-multiplayer-coop', {
        body: { team, dungeonName: d?.name, difficulty: d?.difficulty }
      });
      if (error) throw error;
      for (let i = 0; i < 6; i++) await useCredit("custom_generation", "Multiplayer Co-Op");
      setResult(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-2">
          <Users className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Multiplayer Co-Op</h2>
        <p className="text-muted-foreground text-sm">Team up your pets to conquer AI-generated dungeons</p>
        <p className="text-xs text-primary font-semibold">6 Credits per dungeon run</p>
      </div>

      {/* Dungeon Selection */}
      <div className="grid grid-cols-2 gap-3">
        {dungeons.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border-border/40 bg-card/80 backdrop-blur-sm cursor-pointer transition-all active:scale-[0.97] ${dungeon === d.id ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/30"}`}
              onClick={() => setDungeon(d.id)}>
              <CardContent className="p-3 text-center space-y-1">
                <span className="text-2xl">{d.icon}</span>
                <h3 className="font-bold text-xs">{d.name}</h3>
                <p className="text-[10px] text-muted-foreground">{d.difficulty} • {d.reward}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Select 2-4 pets for your team:</p>
            <div className="grid grid-cols-2 gap-2">
              {pets?.map(p => (
                <Button key={p.id} variant={selectedPetIds.includes(p.id) ? "default" : "outline"} size="sm"
                  className="justify-start text-xs" onClick={() => togglePet(p.id)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {p.name} (Lv.{p.level})
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={startDungeon} disabled={loading || selectedPetIds.length < 2 || !dungeon} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
            Enter Dungeon
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Map className="w-5 h-5 text-indigo-500" />Dungeon Adventure</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
