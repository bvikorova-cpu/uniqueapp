import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { useFreeTierCredits } from "@/hooks/useFreeTierCredits";

export function WelcomeCreditsDialog() {
  const { data, markWelcomeShown } = useFreeTierCredits();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (data && !data.welcome_shown) setOpen(true);
  }, [data]);

  const close = async () => {
    setOpen(false);
    await markWelcomeShown();
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Gift className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl font-black flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Welcome to Unique!
            <Sparkles className="h-5 w-5 text-accent" />
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            We've added <span className="font-bold text-primary">10 free credits</span> to your account to get you started.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5 my-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Free balance</span>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {data.balance} credits
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Refills with <strong>+10 credits</strong> every month, automatically.
          </p>
        </div>

        <ul className="text-sm space-y-1.5 text-muted-foreground">
          <li>• Try AI tools across 15+ modules</li>
          <li>• No credit card required</li>
          <li>• Top up anytime when you want more</li>
        </ul>

        <DialogFooter>
          <Button onClick={close} className="w-full bg-gradient-to-r from-primary to-accent">
            Start exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
