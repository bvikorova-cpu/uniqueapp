import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowRight, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CharacterFusionLab = () => {
  const [char1, setChar1] = useState<string | null>(null);
  const [char2, setChar2] = useState<string | null>(null);
  const [fusionResult, setFusionResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("characters").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const fuseMutation = useMutation({
    mutationFn: async ({ char1Id, char2Id }: { char1Id: string; char2Id: string }) => {
      const { data, error } = await supabase.functions.invoke("fuse-characters", {
        body: { character1Id: char1Id, character2Id: char2Id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      setFusionResult(result);
      toast.success("Fusion complete! A new warrior has been born!");
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    },
    onError: (error: Error) => toast.error(error.message || "Fusion failed"),
  });

  const selectedChar1 = characters?.find((c) => c.id === char1);
  const selectedChar2 = characters?.find((c) => c.id === char2);

  return (
    <>
      <FloatingHowItWorks title={"Character Fusion Lab - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Fusion Lab section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Fusion Lab.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Character Fusion Lab</h2>
            <p className="text-muted-foreground text-sm">Merge two warriors into one legendary hybrid • 30 credits</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-center">
          {/* Character 1 */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-amber-400">⚔️ Warrior 1</h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {characters?.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setChar1(c.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    char1 === c.id ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20" : "border-border/30 bg-card/50 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {c.image_url && <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-muted-foreground text-xs">Lv.{c.level} • {c.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fusion Indicator */}
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30"
            >
              <Zap className="h-10 w-10 text-white" />
            </motion.div>
            <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Select two warriors to fuse</p>
          </div>

          {/* Character 2 */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-red-400">🛡️ Warrior 2</h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {characters?.filter((c) => c.id !== char1).map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setChar2(c.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    char2 === c.id ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20" : "border-border/30 bg-card/50 hover:border-red-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {c.image_url && <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-muted-foreground text-xs">Lv.{c.level} • {c.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={() => char1 && char2 && fuseMutation.mutate({ char1Id: char1, char2Id: char2 })}
          disabled={!char1 || !char2 || fuseMutation.isPending}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          size="lg"
        >
          {fuseMutation.isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Fusing Warriors...</>
          ) : (
            <><Sparkles className="mr-2 h-5 w-5" /> Fuse Characters (30 Credits)</>
          )}
        </Button>
      </Card>

      {fusionResult && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
          <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-500/10 backdrop-blur-xl">
            <h3 className="text-2xl font-black text-amber-400 mb-4">🌟 Fusion Result</h3>
            <div className="flex items-start gap-4">
              {fusionResult.imageUrl && <img src={fusionResult.imageUrl} alt={fusionResult.name} className="w-32 h-32 rounded-xl object-cover border-2 border-amber-500/30" />}
              <div>
                <h4 className="text-xl font-bold">{fusionResult.name}</h4>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 mt-1 mb-3">Hybrid Warrior</Badge>
                <p className="text-muted-foreground text-sm">{fusionResult.backstory}</p>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="text-center p-2 bg-card/50 rounded-lg"><p className="text-xs text-muted-foreground">HP</p><p className="font-bold text-red-400">{fusionResult.stats?.hp}</p></div>
                  <div className="text-center p-2 bg-card/50 rounded-lg"><p className="text-xs text-muted-foreground">ATK</p><p className="font-bold text-amber-400">{fusionResult.stats?.attack}</p></div>
                  <div className="text-center p-2 bg-card/50 rounded-lg"><p className="text-xs text-muted-foreground">DEF</p><p className="font-bold text-blue-400">{fusionResult.stats?.defense}</p></div>
                  <div className="text-center p-2 bg-card/50 rounded-lg"><p className="text-xs text-muted-foreground">SPD</p><p className="font-bold text-green-400">{fusionResult.stats?.speed}</p></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
