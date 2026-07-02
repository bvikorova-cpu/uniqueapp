import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const QUESTIONS = [
  {
    q: "Which scent calls to your soul?",
    options: [
      { label: "Frankincense & myrrh", era: "egypt" },
      { label: "Cherry blossoms", era: "japan" },
      { label: "Old leather & parchment", era: "medieval" },
      { label: "Salt & sea spray", era: "viking" },
    ],
  },
  {
    q: "Pick a sound that feels like home",
    options: [
      { label: "Temple bells in the wind", era: "japan" },
      { label: "Crackling fireplace & lute", era: "medieval" },
      { label: "Crashing waves on rocks", era: "viking" },
      { label: "Sand whispering in a desert", era: "egypt" },
    ],
  },
  {
    q: "Your dream attire?",
    options: [
      { label: "Linen robes & gold jewelry", era: "egypt" },
      { label: "Silk kimono", era: "japan" },
      { label: "Velvet & embroidered cloak", era: "medieval" },
      { label: "Fur, iron & woven leather", era: "viking" },
    ],
  },
];

const RESULTS: Record<string, { title: string; emoji: string; desc: string }> = {
  egypt: { title: "Ancient Egyptian", emoji: "𓂀", desc: "You likely walked the temples of the Nile — priest, scribe, or healer." },
  japan: { title: "Feudal Japanese", emoji: "⛩️", desc: "Your soul carries the discipline of samurai or grace of a temple keeper." },
  medieval: { title: "Medieval European", emoji: "🏰", desc: "A scholar, knight, or master craftsperson in stone-walled cities." },
  viking: { title: "Norse Viking", emoji: "⚔️", desc: "Born to the sea — explorer, shieldmaiden, or skald of the fjords." },
};

export const PastLifeEraQuiz = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const handleAnswer = (era: string) => {
    const newScores = { ...scores, [era]: (scores[era] || 0) + 1 };
    setScores(newScores);
    if (step + 1 >= QUESTIONS.length) setDone(true);
    else setStep(step + 1);
  };

  const reset = () => {
    setStep(0);
    setScores({});
    setDone(false);
  };

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "egypt";

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Era Quiz'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Era Quiz panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔮</span>
        <h3 className="font-black text-sm">Era Quiz</h3>
        <span className="ml-auto text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">FREE</span>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
              <span>Question {step + 1} / {QUESTIONS.length}</span>
              <span>{Math.round(((step) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((step) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <p className="text-sm font-bold mb-3">{QUESTIONS[step].q}</p>
            <div className="space-y-2">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleAnswer(opt.era)}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-border/40 bg-muted/10 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2">
            <div className="text-5xl mb-2">{RESULTS[winner].emoji}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">You were likely</p>
            <h4 className="text-base font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {RESULTS[winner].title}
            </h4>
            <p className="text-xs text-muted-foreground mt-2 mb-3">{RESULTS[winner].desc}</p>
            <Button size="sm" variant="outline" onClick={reset} className="text-xs gap-1.5 w-full">
              <RotateCcw className="h-3 w-3" />
              Try again
            </Button>
            <p className="text-[10px] text-primary mt-2 flex items-center justify-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Unlock full reading for deeper insight
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
    </>
  );
};
