import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Gift, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { triggerRewardConfetti } from "@/utils/confetti";

const STORAGE_KEY = "unique_onboarding_v1";

export function WelcomeOnboarding() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `${STORAGE_KEY}_${user.id}`;
    if (localStorage.getItem(key)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      timer = setTimeout(() => setOpen(true), 2500);
    };
    if (document.readyState === "complete") {
      schedule();
    } else {
      const onLoad = () => schedule();
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        window.removeEventListener("load", onLoad);
        if (timer) clearTimeout(timer);
      };
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [user?.id]);

  const finish = () => {
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify({ at: Date.now() }));
    }
    setOpen(false);
  };

  return (
    <Dialog modal={false} open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-primary/30 bg-gradient-to-br from-background via-background to-primary/5">
        <DialogTitle className="sr-only">Welcome to Unique</DialogTitle>
        <DialogDescription className="sr-only">Your welcome gift is ready.</DialogDescription>
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${((step + 1) / 2) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="p-8 pt-10 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.6 }}
                  className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/40"
                >
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Welcome to Unique
                </h2>
                <p className="text-muted-foreground">
                  Discover talents, win prizes, and join a creative community.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Badge variant="secondary" className="gap-1"><Trophy className="h-3 w-3" /> Cash prizes</Badge>
                  <Badge variant="secondary" className="gap-1"><Gift className="h-3 w-3" /> Free credits</Badge>
                </div>
                <Button onClick={() => setStep(1)} size="lg" className="w-full gap-2 mt-4">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="reward"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onAnimationComplete={() => triggerRewardConfetti()}
                className="p-8 pt-10 text-center space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.2 }}
                  className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-orange-500/50"
                >
                  <Gift className="h-12 w-12 text-white" />
                </motion.div>
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                  >
                    +5 credits
                  </motion.div>
                  <p className="text-muted-foreground mt-2">Welcome gift unlocked. Start exploring now.</p>
                </div>

                <Button onClick={finish} size="lg" className="w-full">
                  Start exploring
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WelcomeOnboarding;
