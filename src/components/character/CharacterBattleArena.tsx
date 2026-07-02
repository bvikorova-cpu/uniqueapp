import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Loader2, Shield, Zap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CharacterBattleArena = () => {
  const [selectedChar1, setSelectedChar1] = useState<string | null>(null);
  const [selectedChar2, setSelectedChar2] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("characters").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const battle = useMutation({
    mutationFn: async (data: { character1Id: string; character2Id: string }) => {
      const { data: result, error } = await supabase.functions.invoke('battle-characters', { body: data });
      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      setBattleResult(result);
      toast.success("Battle complete!");
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to start battle"),
  });

  const renderCharList = (selectedId: string | null, onSelect: (id: string) => void, label: string, accentColor: string) => (
    <div>
      <h3 className="font-bold text-sm mb-3 text-foreground flex items-center gap-2">
        <Swords className="h-4 w-4" /> {label}
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {characters?.map((char) => (
          <motion.div
            key={char.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(char.id)}
            className={`p-3 rounded-xl cursor-pointer border transition-all ${
              selectedId === char.id ? `border-${accentColor}-500 bg-${accentColor}-500/10 shadow-lg shadow-${accentColor}-500/20` : "border-border/30 bg-card/50 hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {char.image_url && <img src={char.image_url} alt={char.name} className="w-12 h-12 rounded-xl object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{char.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Lv.{char.level}</span>
                  <span>•</span>
                  <span className="text-green-400">{char.wins}W</span>
                  <span className="text-red-400">{char.losses}L</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[10px]">
                <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-400" />{char.hp}</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400" />{char.attack}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title={"Character Battle Arena - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Battle Arena section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Battle Arena.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Swords className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Battle Arena</h2>
            <p className="text-muted-foreground text-sm">Select two warriors and let them clash • 2 credits</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {renderCharList(selectedChar1, setSelectedChar1, "Fighter 1", "blue")}
          {renderCharList(selectedChar2, setSelectedChar2, "Fighter 2", "red")}
        </div>

        <Button
          onClick={() => {
            if (!selectedChar1 || !selectedChar2) { toast.error("Select two characters"); return; }
            if (selectedChar1 === selectedChar2) { toast.error("Cannot battle the same character"); return; }
            battle.mutate({ character1Id: selectedChar1, character2Id: selectedChar2 });
          }}
          disabled={battle.isPending || !selectedChar1 || !selectedChar2}
          className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
          size="lg"
        >
          {battle.isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Battle in Progress...</>
          ) : (
            <><Swords className="mr-2 h-5 w-5" /> Start Battle (2 Credits)</>
          )}
        </Button>
      </Card>

      {battleResult && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
          <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-xl">
            <h3 className="text-2xl font-black text-amber-400 mb-4">🏆 Battle Result</h3>
            <div className="mb-4">
              <p className="text-lg">
                <span className="font-black text-amber-400">{battleResult.winner.name}</span>{" "}
                <span className="text-muted-foreground">defeats</span>{" "}
                <span className="font-bold">{battleResult.loser.name}</span>!
              </p>
            </div>
            <div className="bg-card/30 p-4 rounded-xl border border-border/20">
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">{battleResult.commentary}</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
