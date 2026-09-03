import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { useState } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DISMISS_KEY = "founding_banner_dismissed_v1";

/**
 * Friendly home note about the Founding Members programme.
 * Hidden once the user has dismissed it or the cohort is full.
 */
export function FoundingMembersBanner() {
  const { remaining, isFoundingMember, loading } = useFoundingMember();
  const [dismissed, setDismissed] = useState<boolean>(
    typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1"
  );

  if (loading || isFoundingMember || dismissed || remaining <= 0) return null;

  const onDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <>
      <FloatingHowItWorks title={"Founding Members - How it works"} steps={[{ title: 'Open', desc: 'Access the Founding Members Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Founding Members Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-600/15 backdrop-blur-xl p-4 sm:p-5 my-4 shadow-xl shadow-amber-500/10"
      >
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1 rounded-md text-foreground/60 hover:text-foreground hover:bg-foreground/5"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-black shadow-lg shrink-0">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
              Welcome to the family
              <Sparkles className="h-4 w-4 text-amber-400" />
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              The first 1 000 registered members receive a permanent Verified Founder badge.
              Only <span className="font-bold text-amber-300">{remaining}</span> slots are still available.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
