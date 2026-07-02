import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  credits: number;
  threshold?: number;
}

/**
 * Inline low-balance warning. Renders only if credits <= threshold.
 * Reusable across studio / generators / mentor pages.
 */
export const AICreditsLowBalanceAlert = ({ credits, threshold = 5 }: Props) => {
  const navigate = useNavigate();
  if (credits > threshold) return null;

  return (
    <>
      <FloatingHowItWorks title={"A I Credits Low Balance Alert - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Credits Low Balance Alert section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Credits Low Balance Alert.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 mb-4"
    >
      <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">
          {credits === 0 ? "You're out of AI credits" : `Only ${credits} credits left`}
        </p>
        <p className="text-xs text-muted-foreground">Top up now — Basic pack starts at €10 / 25 credits.</p>
      </div>
      <Button size="sm" onClick={() => navigate("/ai-credits")} className="shrink-0">
        Top up
      </Button>
    </motion.div>
    </>
  );
};
