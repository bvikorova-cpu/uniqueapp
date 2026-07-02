import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles, Dna, ArrowRight, Zap, Shield, Flame } from "lucide-react";
import { useUserHorses, useBreedHorses } from "@/hooks/useHorseRacing";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const HorseBreedingLab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { horses } = useUserHorses();
  const breedHorses = useBreedHorses();
  const [parent1, setParent1] = useState("");
  const [parent2, setParent2] = useState("");

  const horse1 = horses?.find(h => h.id === parent1);
  const horse2 = horses?.find(h => h.id === parent2);

  const predictedStats = horse1 && horse2 ? {
    speed: Math.round((horse1.speed_stat + horse2.speed_stat) / 2 + Math.random() * 10 - 5),
    stamina: Math.round((horse1.stamina_stat + horse2.stamina_stat) / 2 + Math.random() * 10 - 5),
    acceleration: Math.round((horse1.acceleration_stat + horse2.acceleration_stat) / 2 + Math.random() * 10 - 5),
    temperament: Math.round((horse1.temperament_stat + horse2.temperament_stat) / 2 + Math.random() * 10 - 5),
  } : null;

  const handleBreed = () => {
    if (!user) { navigate("/auth"); return; }
    if (!parent1 || !parent2) { toast.error("Select both parents"); return; }
    if (parent1 === parent2) { toast.error("Select different horses"); return; }
    breedHorses.mutate({ parent1Id: parent1, parent2Id: parent2 }, {
      onSuccess: () => { setParent1(""); setParent2(""); }
    });
  };

  return (
    <>
      <FloatingHowItWorks title={"Horse Breeding Lab - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Breeding Lab section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Breeding Lab.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Dna className="h-6 w-6 text-purple-400" /> Horse Breeding Lab
        </h2>
        <p className="text-muted-foreground text-sm">Combine bloodlines to create the ultimate champion. Cost: 100 Coins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Parent 1 */}
        <Card className="p-4 border-purple-500/20 bg-card/80 backdrop-blur-sm">
          <h3 className="font-bold text-sm mb-3 text-purple-300 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Parent 1
          </h3>
          <Select value={parent1} onValueChange={setParent1}>
            <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
            <SelectContent>
              {horses?.filter(h => h.id !== parent2).map(h => (
                <SelectItem key={h.id} value={h.id}>{h.name} (Lvl {h.level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {horse1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: horse1.color }} />
                <div>
                  <p className="font-bold text-sm">{horse1.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{horse1.breed}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" /> {horse1.speed_stat}</span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-400" /> {horse1.stamina_stat}</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-400" /> {horse1.acceleration_stat}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-pink-400" /> {horse1.temperament_stat}</span>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Fusion indicator */}
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <ArrowRight className="h-5 w-5 text-purple-400 mt-2 rotate-90 md:rotate-0" />
          {predictedStats && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Predicted Stats</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-yellow-400">SPD ~{predictedStats.speed}</span>
                <span className="text-blue-400">STA ~{predictedStats.stamina}</span>
                <span className="text-orange-400">ACC ~{predictedStats.acceleration}</span>
                <span className="text-pink-400">TMP ~{predictedStats.temperament}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Parent 2 */}
        <Card className="p-4 border-amber-500/20 bg-card/80 backdrop-blur-sm">
          <h3 className="font-bold text-sm mb-3 text-amber-300 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Parent 2
          </h3>
          <Select value={parent2} onValueChange={setParent2}>
            <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
            <SelectContent>
              {horses?.filter(h => h.id !== parent1).map(h => (
                <SelectItem key={h.id} value={h.id}>{h.name} (Lvl {h.level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {horse2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: horse2.color }} />
                <div>
                  <p className="font-bold text-sm">{horse2.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{horse2.breed}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" /> {horse2.speed_stat}</span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-400" /> {horse2.stamina_stat}</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-400" /> {horse2.acceleration_stat}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-pink-400" /> {horse2.temperament_stat}</span>
              </div>
            </motion.div>
          )}
        </Card>
      </div>

      <Button
        onClick={handleBreed}
        disabled={!parent1 || !parent2 || parent1 === parent2 || breedHorses.isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold"
        size="lg"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {breedHorses.isPending ? "Breeding..." : "Breed Horses — 100 Coins"}
      </Button>

      {(!horses || horses.length < 2) && (
        <p className="text-center text-muted-foreground text-sm">You need at least 2 horses to breed.</p>
      )}

      {/* Bloodline info */}
      <Card className="p-4 border-purple-500/10 bg-card/60">
        <h3 className="font-bold text-sm mb-2 text-purple-300">🧬 Breeding Mechanics</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Offspring inherit averaged stats from both parents with ±5 random variation</li>
          <li>• Higher level parents produce stronger offspring</li>
          <li>• Rare breed combinations can unlock unique coat colors</li>
          <li>• Each horse can breed up to 5 times total</li>
        </ul>
      </Card>
    </div>
    </>
  );
};
