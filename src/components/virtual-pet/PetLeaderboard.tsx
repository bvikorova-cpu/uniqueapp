import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Crown, Flame, Swords, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

type LeaderboardTab = "level" | "battles" | "happiness";

export const PetLeaderboard = ({ onBack }: Props) => {
  const [tab, setTab] = useState<LeaderboardTab>("level");

  const { data: pets, isLoading } = useQuery({
    queryKey: ['leaderboard-pets', tab],
    queryFn: async () => {
      const orderCol = tab === "level" ? "level" : tab === "battles" ? "battle_wins" : "happiness";
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, level, happiness, battle_wins, pet_types(name, species)')
        .order(orderCol, { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const tabs = [
    { id: "level" as LeaderboardTab, label: "Top Level", icon: Star },
    { id: "battles" as LeaderboardTab, label: "Battle Kings", icon: Swords },
    { id: "happiness" as LeaderboardTab, label: "Happiest", icon: Flame },
  ];

  const getMedal = (i: number) => {
    if (i === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (i === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  const getValue = (pet: any) => {
    if (tab === "level") return `Lv.${pet.level}`;
    if (tab === "battles") return `${pet.battle_wins || 0} wins`;
    return `${pet.happiness}% happy`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Global Leaderboard</h2>
        <p className="text-muted-foreground text-sm">See the top pets across the platform</p>
      </div>

      <div className="flex gap-2 justify-center">
        {tabs.map(t => (
          <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)} className="gap-1.5 text-xs">
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </Button>
        ))}
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4 space-y-1">
          {isLoading ? (
            <p className="text-center text-muted-foreground text-sm py-8">Loading rankings...</p>
          ) : !pets?.length ? (
            <p className="text-center text-muted-foreground text-sm py-8">No pets found yet</p>
          ) : (
            pets.map((pet, i) => (
              <motion.div key={pet.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${i < 3 ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"}`}>
                {getMedal(i)}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{pet.name}</p>
                  <p className="text-[10px] text-muted-foreground">{pet.pet_types?.name || pet.pet_types?.species}</p>
                </div>
                <span className="text-xs font-semibold text-primary">{getValue(pet)}</span>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
