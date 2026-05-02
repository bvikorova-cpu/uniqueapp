import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus, Eye } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  action?: string; // localized action label
}

export const PaywallModal = ({ open, onClose, action }: PaywallModalProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const actionLabel = action || t("megaforum.paywall.actionDefault");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">
            {t("megaforum.paywall.title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {t("megaforum.paywall.description", { action: actionLabel })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            className="w-full"
            size="lg"
            onClick={() => { onClose(); navigate("/auth"); }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {t("megaforum.paywall.signIn")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => { onClose(); navigate("/auth?mode=signup"); }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("megaforum.paywall.createAccount")}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("megaforum.paywall.keepBrowsing")}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-1">
          {t("megaforum.paywall.footer")}
        </p>
      </DialogContent>
    </Dialog>
  );
};
