import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Crown, Calendar } from "lucide-react";

interface Props {
  subscribed: boolean;
  subscriptionEnd?: string;
  tierName?: string;
}

function getSubscriptionStatus(subscribed: boolean, subscriptionEnd?: string) {
  if (!subscribed) return { label: "No Access", variant: "destructive" as const, icon: XCircle, color: "text-red-400" };

  if (subscriptionEnd) {
    const end = new Date(subscriptionEnd);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: "Expired", variant: "destructive" as const, icon: XCircle, color: "text-red-400", daysLeft: diffDays };
    }
    if (diffDays <= 7) {
      return { label: `Expiring Soon (${diffDays}d)`, variant: "warning" as const, icon: AlertTriangle, color: "text-amber-400", daysLeft: diffDays };
    }
  }

  return { label: "Active", variant: "success" as const, icon: CheckCircle2, color: "text-emerald-400" };
}

function formatNextPaymentDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function SubscriptionStatusBadge({ subscribed, subscriptionEnd, tierName }: Props) {
  const status = getSubscriptionStatus(subscribed, subscriptionEnd);
  const nextPayment = formatNextPaymentDate(subscriptionEnd);
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 border-0 ${
            status.variant === "success"
              ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20"
              : status.variant === "warning"
              ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/20"
              : "bg-red-500/15 text-red-300 hover:bg-red-500/20"
          }`}
        >
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
          {status.label}
        </Badge>
        {subscribed && tierName && (
          <Badge className="flex items-center gap-1.5 text-sm px-3 py-1.5 border-0 bg-primary/15 text-primary hover:bg-primary/20">
            <Crown className="h-4 w-4" />
            {tierName}
          </Badge>
        )}
      </div>
      {subscribed && nextPayment && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Next payment: {nextPayment}</span>
        </div>
      )}
    </div>
  );
}
