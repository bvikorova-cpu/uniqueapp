import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const QuickChallenge = () => {
  const navigate = useNavigate();
  // Pick a category once per mount — recomputing on every render caused the
  // button target to flicker and broke the navigate URL when clicked twice.
  const randomCategory = useMemo(() => {
    const randomCategories = ["math", "biology", "history", "geography", "science"];
    return randomCategories[Math.floor(Math.random() * randomCategories.length)];
  }, []);

  return (
    <>
      <FloatingHowItWorks title="How Quick Challenge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="bg-gradient-to-r from-purple-500/10 via-primary/10 to-accent/10 border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Quick Challenge</h3>
              <p className="text-[10px] text-muted-foreground">30 seconds • 5 questions • 2x XP</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 30s limit</span>
            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Bonus XP</span>
          </div>

          <Button
            onClick={() => navigate(`/quiz?category=${randomCategory}&mode=quick`)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
