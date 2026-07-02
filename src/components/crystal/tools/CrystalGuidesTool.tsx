import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { HEALING_PATHS, CLEANSING_RITUALS } from "../crystalData";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  mode: "guide" | "cleansing";
}

export const CrystalGuidesTool = ({ mode }: Props) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const items = mode === "guide" ? HEALING_PATHS : CLEANSING_RITUALS;
  const selected = items.find(i => i.id === selectedPath);

  const toggleStep = (idx: number) => {
    const next = new Set(completedSteps);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCompletedSteps(next);
  };

  const title = mode === "guide" ? "Crystal Healing Guide" : "Energy Cleansing Rituals";
  const desc = mode === "guide"
    ? "Step-by-step healing journeys for specific intentions"
    : "Learn proper crystal cleansing and charging techniques";
  const Icon = mode === "guide" ? Compass : Zap;

  return (
    <>
      <FloatingHowItWorks title={"Crystal Guides Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Guides Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Guides Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Icon className="w-5 h-5" /> {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardHeader>
      <CardContent>
        {selected ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedPath(null); setCompletedSteps(new Set()); }} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="text-center mb-4">
              <span className="text-3xl">{selected.emoji}</span>
              <h3 className="text-lg font-bold mt-2">{selected.name}</h3>
              {"duration" in selected && <p className="text-xs text-muted-foreground">Duration: {(selected as any).duration}</p>}
              {"crystals" in selected && (
                <div className="flex gap-1.5 justify-center mt-2 flex-wrap">
                  {(selected as any).crystals.map((c: string) => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {selected.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleStep(i)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${completedSteps.has(i) ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border/30 hover:border-primary/20"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${completedSteps.has(i) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {completedSteps.has(i) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm ${completedSteps.has(i) ? "text-foreground line-through opacity-70" : "text-muted-foreground"}`}>{step}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">{completedSteps.size} of {selected.steps.length} steps completed</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {items.map(item => (
              <div key={item.id} onClick={() => setSelectedPath(item.id)} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 cursor-pointer transition-all">
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  {"duration" in item && <p className="text-xs text-muted-foreground">{(item as any).duration}</p>}
                  {"crystals" in item && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(item as any).crystals.map((c: string) => <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{c}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
