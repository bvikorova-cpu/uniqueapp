import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";
import { BullyDecoderCard } from "./ai/BullyDecoderCard";
import { EvidenceBuilderCard } from "./ai/EvidenceBuilderCard";
import { ResponseCoachCard } from "./ai/ResponseCoachCard";
import { CyberRiskScanCard } from "./ai/CyberRiskScanCard";
import { useSafetyCredits } from "@/hooks/useSafetyAIFeatures";

export function SafetyAIShield() {
  const { data: credits } = useSafetyCredits();

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-teal-400" />
        <h2 className="text-xl sm:text-2xl font-black text-foreground">AI Shield</h2>
        <span className="text-xs text-muted-foreground">— Premium AI safety tools</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30">
          <Sparkles className="w-3 h-3 text-teal-300" />
          <span className="text-xs font-bold text-teal-200">{credits?.credits_remaining ?? 0} credits</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <BullyDecoderCard />
        <EvidenceBuilderCard />
        <ResponseCoachCard />
        <CyberRiskScanCard />
      </div>
    </motion.section>
  );
}
