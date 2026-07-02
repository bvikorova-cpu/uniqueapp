import { motion } from "framer-motion";
import { Sparkles, Shield, CreditCard, Calendar } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TrialBannerProps {
  days?: number;
}

/**
 * 7-day free trial promise. Reduces friction for first-time subscribers.
 * The actual trial period must be configured on the Stripe price (`trial_period_days`).
 */
export const TrialBanner = ({ days = 7 }: TrialBannerProps) => {
  const points = [
    { icon: Calendar, label: `${days} days free` },
    { icon: CreditCard, label: "No charge today" },
    { icon: Shield, label: "Cancel anytime" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Trial Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Trial Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trial Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-10 max-w-3xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-black text-base sm:text-lg">Try Premium free for {days} days</div>
              <div className="text-xs text-muted-foreground">Full access. No commitment.</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {points.map((p) => (
              <div key={p.label} className="flex items-center gap-1.5 text-xs sm:text-sm">
                <p.icon className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
