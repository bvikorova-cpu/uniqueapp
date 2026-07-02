import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Zap } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  backersCount: number;
  supportersCount: number;
  recentDonationsLast24h?: number;
  averagePledge?: number;
}

export function DreamSocialProof({
  backersCount,
  supportersCount,
  recentDonationsLast24h = 0,
  averagePledge,
}: Props) {
  const total = backersCount + supportersCount;
  if (total === 0 && recentDonationsLast24h === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Dream Social Proof - How it works"} steps={[{ title: 'Open', desc: 'Access the Dream Social Proof section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dream Social Proof.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
          <div className="text-lg font-black">{total}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Backers
          </div>
        </motion.div>
        {recentDonationsLast24h > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <Zap className="w-4 h-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-black">{recentDonationsLast24h}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Last 24h
            </div>
          </motion.div>
        )}
        {averagePledge != null && averagePledge > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-black">€{averagePledge.toFixed(0)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Avg pledge
            </div>
          </motion.div>
        )}
      </div>
    </Card>
    </>
  );
}
