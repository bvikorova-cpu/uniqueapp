import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useLotteryStats } from "@/hooks/useLotteryStats";

export const LotteryProgress = () => {
  const { data: stats } = useLotteryStats();

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Progress'
        steps={[
          { title: 'Check your totals', desc: 'See how many sets you generated and saved.' },
          { title: 'Generate now', desc: 'Jump straight to the AI generator on this page.' },
          { title: 'Save favourites', desc: 'Mark the sets you like to grow your saved count.' },
          { title: 'Track over time', desc: 'Numbers update automatically after every generation.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="bg-gradient-to-r from-purple-500/10 via-primary/10 to-accent/10 border-primary/20 overflow-hidden relative h-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Quick Generate</h3>
              <p className="text-[10px] text-muted-foreground">AI-powered • Smart picks • Pattern aware</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Analysis</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Pattern Match</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
              <div className="text-lg font-black text-primary">{stats?.total ?? 0}</div>
              <div className="text-[10px] text-muted-foreground">Generated</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
              <div className="text-lg font-black text-accent">{stats?.saved ?? 0}</div>
              <div className="text-[10px] text-muted-foreground">Saved</div>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            size="sm"
            onClick={() => {
              const el = document.querySelector('[data-lottery-generator]') as HTMLElement | null;
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              else window.location.href = "/lottery-ai";
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
