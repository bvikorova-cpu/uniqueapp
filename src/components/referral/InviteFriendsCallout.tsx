import { motion } from "framer-motion";
import { UserPlus, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

/**
 * Lightweight, dismissible promo card surfacing the existing referral
 * programme on the homepage so users discover it without diving into menus.
 */
export function InviteFriendsCallout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/15 via-teal-400/10 to-emerald-600/15 backdrop-blur-xl p-4 sm:p-5 shadow-xl shadow-emerald-500/10"
    >
      <FloatingHowItWorks
        title={"Invite Friends Callout"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-black shadow-lg shrink-0">
          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
            Invite friends, earn rewards
            <Gift className="h-4 w-4 text-emerald-300" />
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Share your personal link — both you and your friend get bonus credits when they join.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:from-emerald-400 hover:to-teal-300 font-bold shadow-lg">
          <Link to="/referral" className="flex items-center gap-1">
            Get my link <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
