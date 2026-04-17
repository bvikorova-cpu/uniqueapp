import { motion } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  sponsorName: string;
  sponsorLogoUrl?: string | null;
  matchRatio: number;
  matchCap: number;
  matchedSoFar: number;
}

export function MatchDonationBadge({ sponsorName, sponsorLogoUrl, matchRatio, matchCap, matchedSoFar }: Props) {
  const pct = Math.min((matchedSoFar / matchCap) * 100, 100);
  const remaining = Math.max(matchCap - matchedSoFar, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 border-amber-500/30 shadow-[0_0_20px_-10px_rgba(251,191,36,0.4)]">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-amber-500/30 rounded-xl blur-md animate-pulse" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg">
              {sponsorLogoUrl ? (
                <img src={sponsorLogoUrl} alt={sponsorName} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <Zap className="w-6 h-6 text-white" fill="white" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">Match Active</span>
              <span className="text-[10px] px-1.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">{matchRatio}×</span>
            </div>
            <p className="font-bold text-sm leading-tight truncate">
              {sponsorName} is matching every euro
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              €{remaining.toLocaleString()} remaining of €{matchCap.toLocaleString()} match pool
            </p>
            <Progress value={pct} className="h-1.5 mt-2" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
