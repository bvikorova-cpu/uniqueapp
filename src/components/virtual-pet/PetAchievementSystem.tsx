import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Award, Loader2, Sparkles, Trophy, Medal, Crown } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Props { onBack: () => void; }

const species = ["Dog", "Cat", "Dragon", "Phoenix", "Unicorn", "Wolf", "Fox", "Rabbit", "Parrot", "Hamster"];

export const PetAchievementSystem = ({ onBack }: Props) => {
  const [petName, setPetName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [level, setLevel] = useState("5");
  const [battlesWon, setBattlesWon] = useState("10");
  const [achievements, setAchievements] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { useCredit } = useAICredits();

  const handleGenerate = async () => {
    if (!petName || !selectedSpecies) return toast.error("Fill in pet details");

    const hasCredits = await useCredit("custom_generation", "Achievement System");
    if (!hasCredits) return toast.error("Not enough credits!");

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-achievements", {
        body: { petName, species: selectedSpecies, level: parseInt(level), battlesWon: parseInt(battlesWon) },
      });
      if (error) throw error;
      setAchievements(data);
      toast.success("Achievements analyzed!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const tierColors: Record<string, string> = {
    "Bronze": "text-orange-600", "Silver": "text-muted-foreground", "Gold": "text-amber-500", "Platinum": "text-cyan-400", "Diamond": "text-primary"
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black">Pet Achievement System</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          AI analyzes your pet's stats to unlock personalized achievements, badges, and milestones. Track progress and earn exclusive titles.
        </p>
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">3 Credits per analysis</span>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="w-5 h-5" />Analyze Achievements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Pet name..." />
          <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
            <SelectTrigger><SelectValue placeholder="Species..." /></SelectTrigger>
            <SelectContent>{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Level</label>
              <Input type="number" min="1" max="100" value={level} onChange={e => setLevel(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Battles Won</label>
              <Input type="number" min="0" value={battlesWon} onChange={e => setBattlesWon(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Analyze Achievements"}
          </Button>
        </CardContent>
      </Card>

      {achievements && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-black text-lg">{achievements.title}</h3>
                <p className="text-xs text-muted-foreground">{achievements.rank}</p>
              </div>

              <div className="space-y-3">
                {achievements.unlocked?.map((badge: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-background/80 border border-border/40 flex items-start gap-3">
                    <span className="text-2xl">{badge.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{badge.name}</p>
                        <span className={`text-[10px] font-semibold ${tierColors[badge.tier] || "text-foreground"}`}>{badge.tier}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                      <Progress value={badge.progress || 100} className="h-1 mt-1.5" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-bold mb-1 flex items-center gap-1"><Medal className="w-3 h-3" />Next Milestone</p>
                <p className="text-[11px] text-muted-foreground">{achievements.next_milestone}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
