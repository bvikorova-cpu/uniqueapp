/**
 * Floating PWA install banner.
 *
 * Appears bottom-center after a short delay if the install prompt is available
 * and the user hasn't dismissed in the last 14 days. iOS shows a help string
 * (no programmatic install API on Safari).
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";

const SHOW_DELAY_MS = 8_000;

export function InstallPromptBanner() {
  const { canInstall, platform, promptInstall, dismiss } = useInstallPrompt();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!canInstall || !visible) return null;

  const isIOS = platform === "ios";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="fixed inset-x-3 bottom-3 md:inset-x-auto md:right-6 md:bottom-6 z-[60] md:max-w-sm"
        role="dialog"
        aria-label="Install app"
      >
        <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/20 p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shrink-0">
              {isIOS ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Install Unique</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isIOS
                  ? "Tap Share, then Add to Home Screen for the full app experience."
                  : "Faster loads, offline access and a home-screen icon."}
              </p>
            </div>
            <button
              onClick={() => {
                dismiss();
                setVisible(false);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 -mt-1"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isIOS && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={async () => {
                  const outcome = await promptInstall();
                  if (outcome !== "unsupported") setVisible(false);
                }}
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  dismiss();
                  setVisible(false);
                }}
              >
                Later
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
