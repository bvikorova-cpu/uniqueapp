import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed, Loader2, AlertTriangle } from "lucide-react";

export type MatchStatus = "ready" | "in_progress" | "finished" | "failed";

const CONFIG: Record<
  MatchStatus,
  { label: string; hint: string; icon: typeof CheckCircle2; className: string }
> = {
  ready: {
    label: "Ready",
    hint: "Match created. Leaderboard and history update only after the duel is finished.",
    icon: CircleDashed,
    className: "border-primary/30 text-primary",
  },
  in_progress: {
    label: "In progress",
    hint: "Duel running — stats, ELO and leaderboard are not recorded yet.",
    icon: Loader2,
    className: "border-yellow-500/40 text-yellow-600",
  },
  finished: {
    label: "Finished",
    hint: "Result saved. Leaderboard, history and credits are now up to date.",
    icon: CheckCircle2,
    className: "border-green-500/40 text-green-600",
  },
  failed: {
    label: "Not saved",
    hint: "The match could not be finished, so nothing was written to the leaderboard.",
    icon: AlertTriangle,
    className: "border-destructive/40 text-destructive",
  },
};

interface Props {
  status: MatchStatus;
  matchId?: string | null;
  showHint?: boolean;
  className?: string;
}

export const MatchStatusIndicator = ({ status, matchId, showHint = false, className = "" }: Props) => {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Badge
        variant="outline"
        className={`gap-1 text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}
        title={cfg.hint}
        aria-label={`Match status: ${cfg.label}`}
      >
        <Icon className={`h-3 w-3 ${status === "in_progress" ? "animate-spin" : ""}`} />
        {cfg.label}
        {matchId && <span className="ml-1 opacity-60 normal-case">#{matchId.slice(0, 6)}</span>}
      </Badge>
      {showHint && <p className="text-[11px] text-muted-foreground leading-snug">{cfg.hint}</p>}
    </div>
  );
};

export default MatchStatusIndicator;
