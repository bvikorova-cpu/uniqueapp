import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { getMoonPhase, MOON_PHASES, CRYSTAL_DATABASE } from "../crystalData";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalMoonPhaseTool = () => {
  const currentPhase = getMoonPhase();

  return (
    <>
      <FloatingHowItWorks title={"Crystal Moon Phase Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Moon Phase Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Moon Phase Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Moon className="w-5 h-5" /> Moon Phase Crystals
        </CardTitle>
        <p className="text-sm text-muted-foreground">Crystal recommendations aligned with current lunar energy</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
          <div className="text-6xl mb-3">{currentPhase.emoji}</div>
          <h3 className="text-2xl font-black">{currentPhase.name}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{currentPhase.guidance}</p>
        </motion.div>

        <div>
          <h4 className="font-bold text-sm mb-3">Recommended Crystals for {currentPhase.name}</h4>
          <div className="grid gap-3">
            {currentPhase.crystals.map(name => {
              const crystal = CRYSTAL_DATABASE.find(c => c.name === name);
              if (!crystal) return null;
              return (
                <motion.div key={name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h5 className="font-bold text-sm">{crystal.name}</h5>
                  <div className="flex gap-2 mt-1 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{crystal.chakra}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">{crystal.element}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{crystal.properties}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">"{crystal.mantra}"</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-3">All Moon Phases</h4>
          <div className="grid grid-cols-4 gap-2">
            {MOON_PHASES.map(phase => (
              <div key={phase.name} className={`text-center p-3 rounded-xl border transition-all ${phase.name === currentPhase.name ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border/30"}`}>
                <div className="text-2xl mb-1">{phase.emoji}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{phase.name}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
