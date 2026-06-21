import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Gift, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { triggerRewardConfetti } from "@/utils/confetti";

const INTERESTS = [
  { id: "talent", label: "Megatalent", emoji: "🎤", hub: "/megatalent" },
  { id: "fitness", label: "Fitness", emoji: "💪", hub: "/fitness" },
  { id: "food", label: "Food & Recipes", emoji: "🍳", hub: "/masterchef" },
  { id: "education", label: "Learning", emoji: "📚", hub: "/education/hub" },
  { id: "gaming", label: "Gaming", emoji: "🎮", hub: "/shadow-arena" },
  { id: "fashion", label: "Fashion", emoji: "👗", hub: "/fashion-studio" },
  { id: "music", label: "Music", emoji: "🎵", hub: "/concert" },
  { id: "art", label: "Art & Design", emoji: "🎨", hub: "/creator-studio" },
  { id: "wellness", label: "Wellness", emoji: "🧘", hub: "/wellness" },
];

const STORAGE_KEY = "unique_onboarding_v1";

export function WelcomeOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const key = `${STORAGE_KEY}_${user.id}`;
    if (localStorage.getItem(key)) return;
    // Wait for the page to be fully loaded (hero/feed rendered) before showing
    // the welcome modal so it doesn't overlap skeleton screens.
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
    if (user) localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify({ at: Date.now(), interests: selected }));
    setOpen(false);
  };

  const toggleInterest = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const recommended = INTERESTS.filter((i) => selected.includes(i.id)).slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-primary/30 bg-gradient-to-br from-background via-background to-primary/5">
        <DialogTitle className="sr-only">Welcome to Unique</DialogTitle>
        <div className="relative">
          {/* progress */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${((step + 1) / 3) * 100}%` }}
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
                  Discover talents, win prizes, and join a creative community. Let's personalize your experience in 30 seconds.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Badge variant="secondary" className="gap-1"><Trophy className="h-3 w-3" /> €10,000 prizes</Badge>
                  <Badge variant="secondary" className="gap-1"><Gift className="h-3 w-3" /> Free credits</Badge>
                </div>
                <Button onClick={() => setStep(1)} size="lg" className="w-full gap-2 mt-4">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 pt-10 space-y-4"
              >
                <div>
                  <h3 className="text-xl font-bold">What are you into?</h3>
                  <p className="text-sm text-muted-foreground">Pick at least 2 — we'll recommend the best hubs.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {INTERESTS.map((i) => {
                    const active = selected.includes(i.id);
                    return (
                      <button
                        key={i.id}
                        onClick={() => toggleInterest(i.id)}
                        className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                          active
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="text-2xl mb-1">{i.emoji}</div>
                        <div className="text-xs font-medium">{i.label}</div>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={selected.length < 2}
                  size="lg"
                  className="w-full gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
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
                    +10 credits
                  </motion.div>
                  <p className="text-muted-foreground mt-2">Welcome gift unlocked. Start exploring now.</p>
                </div>

                {recommended.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended for you</p>
                    <div className="grid grid-cols-2 gap-2">
                      {recommended.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => { finish(); navigate(r.hub); }}
                          className="p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                        >
                          <div className="text-xl">{r.emoji}</div>
                          <div className="text-sm font-semibold">{r.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={finish} variant="ghost" className="w-full">
                  Explore on my own
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
