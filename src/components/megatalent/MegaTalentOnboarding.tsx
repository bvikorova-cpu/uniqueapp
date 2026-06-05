import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Upload, Heart, Award, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY_PREFIX = "megatalent_onboarding_done_";

const steps = [
  {
    icon: Trophy,
    title: "Welcome to the MegaTalent Contest 🏆",
    description:
      "Participate in monthly contests across 35+ categories — from singing to dancing to art. The best talents win cash prizes, visibility, and a TOP Premium badge.",
    bullets: [
      "Monthly rounds with winners announcement",
      "Real users vote + AI Performance Score",
      "Fair-play: one account = one vote per day",
    ],
  },
  {
    icon: Upload,
    title: "How to upload a photo or video 📸",
    description:
      "In the category, click the 'Upload' button and select a file from your device. We accept photos (JPG, PNG, WEBP up to 10 MB) and videos (MP4, MOV up to 100 MB / max. 60 seconds).",
    bullets: [
      "Choose the correct category (you cannot change it later)",
      "Add a short description and hashtags — this helps the algorithm",
      "The face must be yours — no stolen footage",
    ],
  },
  {
    icon: Heart,
    title: "Hlasovanie a boost ❤️",
    description:
      "Your fans vote with their hearts. Premium subscribers get 2× vote weight, TOP Premium gets up to 3× and a daily vote-boost.",
    bullets: [
      "Share your post via Share — this invites more votes",
      "Use AI Talent Coach to improve performance",
      "Sleduj Live Leaderboard pre real-time poradie",
    ],
  },
  {
    icon: Award,
    title: "Contest rules ⚖️",
    description:
      "To make the contest fair, please follow these rules. Violation means disqualification without refund of subscription.",
    bullets: [
      "No nude content, violence, hate or spam",
      "No buying votes or fake accounts",
      "Content must be your own creation (or with consent)",
      "Age 13+ (younger with parent's consent only)",
    ],
  },
];

export const MegaTalentOnboarding = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Defense-in-depth: even though MegatalentGuard already blocks
    // unauthenticated/unsubscribed users, never show onboarding without a user.
    if (!user) return;
    const key = STORAGE_KEY_PREFIX + user.id;
    const done = localStorage.getItem(key);
    if (!done) {
      // Small delay so it doesn't pop instantly on mount
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [user]);

  // Hard guard: render nothing if no user (subscription is enforced by MegatalentGuard wrapper)
  if (!user) return null;

  const finish = () => {
    if (user) localStorage.setItem(STORAGE_KEY_PREFIX + user.id, "1");
    setOpen(false);
  };

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{current.title}</DialogTitle>
          <DialogDescription className="text-center">{current.description}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-2">
          {current.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 my-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={finish}>
              Skip
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => (isLast ? finish() : setStep(step + 1))}
          >
            {isLast ? "Start competing 🚀" : (
              <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
