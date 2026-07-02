import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus, Eye } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  action?: string; // localized action label
}

export const PaywallModal = ({ open, onClose, action }: PaywallModalProps) => {
  const navigate = useNavigate();
  const actionLabel = action || "interact";

  return (
    <Dialog open={open} onOpenChange={(o) =>
      <FloatingHowItWorks
        title={"Paywall Modal"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />
 !o && onClose()}>
      <DialogContent className="max-w-sm bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">
            {"Join the conversation"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {`To ${actionLabel} on Megaforum you need an account. Browsing stays free — sign in only when you want to engage.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            className="w-full"
            size="lg"
            onClick={() => { onClose(); navigate("/auth"); }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {"Sign In"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => { onClose(); navigate("/auth?mode=signup"); }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {"Create Account"}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
          >
            <Eye className="h-4 w-4 mr-2" />
            {"Keep Browsing"}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-1">
          {"AI tools cost 3–5 credits • Premium features require subscription"}
        </p>
      </DialogContent>
    </Dialog>
  );
};
