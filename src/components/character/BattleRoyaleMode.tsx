import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Flame, Shield, Skull, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const BattleRoyaleMode = () => {
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [royaleResult, setRoyaleResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("characters").select("*").order("level", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const startRoyale = useMutation({
    mutationFn: async (characterIds: string[]) => {
      const { data, error } = await supabase.functions.invoke("battle-royale", {
        body: { characterIds },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      setRoyaleResult(result);
      toast.success("Battle Royale complete!");
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    },
    onError: (error: Error) => toast.error(error.message || "Battle Royale failed"),
  });

  const toggleChar = (id: string) => {
    setSelectedChars((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 8 ? [...prev, id] : prev);
  };

  return (
    <>
      <FloatingHowItWorks title={"Battle Royale Mode - How it works"} steps={[{ title: 'Open', desc: 'Access the Battle Royale Mode section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Battle Royale Mode.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Battle Royale</h2>
            <p className="text-muted-foreground text-sm">8 warriors enter, only 1 survives • 10 credits</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="border-amber-500/30 text-amber-400">
            {selectedChars.length}/8 Selected
          </Badge>
          {selectedChars.length >= 4 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready!</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {characters?.map((c) => {
            const isSelected = selectedChars.includes(c.id);
            const rank = isSelected ? selectedChars.indexOf(c.id) + 1 : null;
            return (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleChar(c.id)}
                className={`relative p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20" : "border-border/30 bg-card/50 hover:border-red-500/40"
                }`}
              >
                {rank && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center p-0 rounded-full">
                    {rank}
                  </Badge>
                )}
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-20 rounded-lg object-cover mb-2" />}
                <p className="font-bold text-xs truncate">{c.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Shield className="h-3 w-3" /> Lv.{c.level}
                  <span>•</span>
                  <span>{c.wins}W</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={() => startRoyale.mutate(selectedChars)}
          disabled={selectedChars.length < 4 || startRoyale.isPending}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
          size="lg"
        >
          {startRoyale.isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Battle in Progress...</>
          ) : (
            <><Flame className="mr-2 h-5 w-5" /> Start Battle Royale ({selectedChars.length} Warriors)</>
          )}
        </Button>
      </Card>

      {royaleResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring" }}>
          <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-red-900/20 backdrop-blur-xl">
            <div className="text-center mb-6">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-3xl font-black text-amber-400">Champion!</h3>
            </div>
            
            {royaleResult.winner && (
              <div className="flex items-center justify-center gap-4 mb-6">
                {royaleResult.winner.image_url && (
                  <img src={royaleResult.winner.image_url} alt={royaleResult.winner.name} className="w-24 h-24 rounded-xl object-cover border-2 border-yellow-500/50" />
                )}
                <div>
                  <p className="text-xl font-black text-yellow-400">{royaleResult.winner.name}</p>
                  <Badge className="bg-yellow-500/20 text-yellow-400">Last Warrior Standing</Badge>
                </div>
              </div>
            )}

            {royaleResult.rounds?.map((round: any, i: number) => (
              <div key={i} className="p-3 bg-card/30 rounded-lg mb-2 border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <Skull className="h-4 w-4 text-red-400" />
                  <span className="font-bold text-sm">Round {i + 1}</span>
                </div>
                <p className="text-muted-foreground text-sm">{round.commentary}</p>
              </div>
            ))}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
