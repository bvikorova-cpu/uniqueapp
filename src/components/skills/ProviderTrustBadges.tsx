import { BadgeCheck, Star, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ProviderTrust = {
  isVerified?: boolean | null;
  verificationTier?: string | null;
  completedJobs?: number | null;
  rating?: { avg: number; count: number } | null;
};

export function ProviderTrustBadges({ trust, className = "" }: { trust: ProviderTrust; className?: string }) {
  const verified = trust.isVerified || (trust.verificationTier && trust.verificationTier !== "none");
  const jobs = trust.completedJobs ?? 0;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {verified && (
        <Badge variant="secondary" className="gap-1 border-primary/30 bg-primary/10 text-primary">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified provider
        </Badge>
      )}
      {trust.rating && trust.rating.count > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          {trust.rating.avg.toFixed(1)} ({trust.rating.count})
        </span>
      )}
      {jobs > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {jobs} completed
        </span>
      )}
    </div>
  );
}
