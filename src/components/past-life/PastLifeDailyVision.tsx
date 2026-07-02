import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const VISIONS = [
  "A weaver in the silk markets of Constantinople, 1350 CE",
  "A scholar in the Library of Alexandria, 200 BCE",
  "A blacksmith forging swords in 12th century Norway",
  "A geisha mastering tea ceremony in Kyoto, 1780",
  "A monk illuminating manuscripts in medieval Ireland",
  "A merchant traveling the Silk Road, 850 CE",
];

export const PastLifeDailyVision = () => {
  const [vision, setVision] = useState("");
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const idx = Math.abs(today.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % VISIONS.length;
    setVision(VISIONS[idx]);
    setClaimed(localStorage.getItem(`pl-vision-${today}`) === "1");
  }, []);

  const handleClaim = () => {
    localStorage.setItem(`pl-vision-${new Date().toDateString()}`, "1");
    setClaimed(true);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Daily Vision'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Daily Vision panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 backdrop-blur-xl border-primary/30">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -right-8 -top-8 w-32 h-32 opacity-20"
      >
        <div className="w-full h-full rounded-full border-2 border-dashed border-primary" />
      </motion.div>
      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-black text-sm">Daily Vision</h3>
          <span className="ml-auto text-[10px] text-primary font-bold">FREE</span>
        </div>
        <p className="text-xs text-muted-foreground italic mb-3 min-h-[36px]">
          "{vision}"
        </p>
        <Button
          size="sm"
          variant={claimed ? "outline" : "default"}
          className="w-full text-xs gap-1.5"
          onClick={handleClaim}
          disabled={claimed}
        >
          {claimed ? (
            <>
              <Sparkles className="h-3 w-3" />
              Vision claimed today
            </>
          ) : (
            <>
              <Gift className="h-3 w-3" />
              Claim free glimpse
            </>
          )}
        </Button>
      </div>
    </Card>
    </>
  );
};
