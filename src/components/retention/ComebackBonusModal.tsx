import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LAST_VISIT_KEY = "unique_last_visit";
const SHOWN_KEY = "unique_comeback_shown_at";
const ABSENCE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * "Welcome back" bonus modal — shows once when a logged-in user returns after >7 days
 * away. Visual nudge only; actual credit grant should be wired to a server claim later.
 */
export const ComebackBonusModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [daysAway, setDaysAway] = useState(0);

  useEffect(() => {
    if (!user) return;
    try {
      const now = Date.now();
      const last = Number(localStorage.getItem(LAST_VISIT_KEY) || 0);
      const lastShown = Number(localStorage.getItem(SHOWN_KEY) || 0);
      const gap = last ? now - last : 0;

      if (last && gap > ABSENCE_THRESHOLD_MS && now - lastShown > COOLDOWN_MS) {
        setDaysAway(Math.floor(gap / (24 * 60 * 60 * 1000)));
        setOpen(true);
        localStorage.setItem(SHOWN_KEY, String(now));
      }
      localStorage.setItem(LAST_VISIT_KEY, String(now));
    } catch {
      /* private mode → noop */
    }
  }, [user?.id]);

  const claim = () => {
    setOpen(false);
    navigate("/ai-credits?bonus=comeback");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        <DialogHeader>
          <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground shadow-lg shadow-primary/30">
            <Gift className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome back!</DialogTitle>
          <DialogDescription className="text-center">
            You've been away for <strong>{daysAway} days</strong>. Here's a small comeback bonus to get you rolling again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-2 py-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            +5 free credits
          </span>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={() => setOpen(false)}>Later</Button>
          <Button onClick={claim} className="bg-gradient-to-r from-primary to-accent">Claim now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComebackBonusModal;
