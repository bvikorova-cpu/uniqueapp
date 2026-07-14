import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Sparkles, Bug, Gift, ArrowRight, Heart } from "lucide-react";

interface BetaTesterNoticeProps {
  onClose?: () => void;
}

export function BetaTesterNotice({ onClose }: BetaTesterNoticeProps) {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[101] flex items-start justify-center overflow-y-auto bg-background/85 backdrop-blur-md p-4 pt-12 sm:items-center sm:pt-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="w-full max-w-md"
        >
          <Card className="relative max-h-[calc(100vh-5rem)] overflow-y-auto border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 p-6 shadow-2xl sm:max-h-[85vh]">
            {/* Decorative background orbs */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative z-10 text-center space-y-5">
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/30"
                >
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <Badge
                  variant="secondary"
                  className="gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Sparkles className="h-3 w-3" />
                  {t("beta.badge", "Beta")}
                </Badge>
                <h2
                  id="beta-title"
                  className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  {t("beta.title", "We are in beta testing")}
                </h2>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  {t(
                    "beta.message_1",
                    "Unique is growing every day. We are currently in an open beta period, which means you may occasionally encounter a small bug or a feature that is still being polished."
                  )}
                </p>
                <p className="flex items-center justify-center gap-1 text-foreground font-medium">
                  <Heart className="h-4 w-4 text-accent" />
                  {t(
                    "beta.no_loss",
                    "No one will lose anything. If a paid feature does not work as promised, we will always refund or restore it."
                  )}
                </p>
                <p>
                  {t(
                    "beta.message_2",
                    "We would be incredibly grateful if you report any issue, typo, or weird behavior. Your feedback helps us make the platform perfect."
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Gift className="h-4 w-4 text-primary" />
                  {t("beta.reward_title", "Thank-you reward for confirmed bugs")}
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-medium">1</span>
                    {t("beta.reward_minor", "Minor issue — +5 AI credits")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-medium">2</span>
                    {t("beta.reward_major", "Major bug — +25 AI credits")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-medium">3</span>
                    {t("beta.reward_critical", "Critical/security issue — +50 AI credits")}
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    handleClose();
                    window.location.href = "/report-bug";
                  }}
                >
                  <Bug className="h-4 w-4" />
                  {t("beta.report_bug", "Report a bug")}
                </Button>
                <Button
                  className="w-full gap-2"
                  onClick={handleClose}
                >
                  {t("beta.start_exploring", "Start exploring")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground/80">
                {t(
                  "beta.thanks",
                  "Thank you for your patience and for being part of Unique. 💜"
                )}
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default BetaTesterNotice;
