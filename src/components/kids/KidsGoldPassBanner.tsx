import { Coins, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";

interface Props {
  /** Module name shown in the banner (e.g. "Homework Helper"). */
  moduleName?: string;
  /** Compact one-line variant for tight layouts. */
  compact?: boolean;
}

/**
 * Slim banner showing the unified AI credit balance for Kids modules.
 * Gold Pass was retired — every AI action deducts credits server-side.
 */
export const KidsGoldPassBanner = ({ moduleName, compact = false }: Props) => {
  const { totalBalance, loading } = useAICredits();

  if (loading) return null;

  if (compact) {
    return (
      <Link
        to="/ai-credits"
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm"
      >
        <Coins className="h-3 w-3" />
        {totalBalance} credits
      </Link>
    );
  }

  return (
    <div
      className="mx-auto max-w-5xl mb-4 rounded-xl border bg-card/70 backdrop-blur p-3 md:p-4 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
          <Coins className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">
              {totalBalance} AI credits available
            </span>
            {moduleName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <Sparkles className="h-3 w-3" />
                {moduleName}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            Each AI action deducts credits. No subscription needed.
          </p>
        </div>
        <Link
          to="/ai-credits"
          className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
        >
          Buy credits
        </Link>
      </div>
    </div>
  );
};

export default KidsGoldPassBanner;
