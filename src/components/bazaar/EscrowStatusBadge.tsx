import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export type EscrowStatus = 'none' | 'held' | 'released' | 'refunded' | 'disputed';

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  autoReleaseAt?: string;
  className?: string;
}

const statusConfig: Record<EscrowStatus, {
  label: string;
  icon: typeof Shield;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}> = {
  none: {
    label: "No Protection",
    icon: Shield,
    variant: "outline",
    className: "text-muted-foreground",
  },
  held: {
    label: "Protected",
    icon: ShieldCheck,
    variant: "default",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  released: {
    label: "Released",
    icon: ShieldCheck,
    variant: "default",
    className: "bg-green-500 hover:bg-green-600",
  },
  refunded: {
    label: "Refunded",
    icon: ShieldX,
    variant: "secondary",
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  disputed: {
    label: "In Dispute",
    icon: ShieldAlert,
    variant: "destructive",
    className: "",
  },
};

export function EscrowStatusBadge({ status, autoReleaseAt, className }: EscrowStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.none;
  const Icon = config.icon;

  const getDaysRemaining = () => {
    if (!autoReleaseAt || status !== 'held') return null;
    const releaseDate = new Date(autoReleaseAt);
    const now = new Date();
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <>
      <FloatingHowItWorks title="How Escrow Status Badge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={config.variant} className={cn("gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      {daysRemaining !== null && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {daysRemaining} days left
        </span>
      )}
    </div>
    </>
    );
}

export default EscrowStatusBadge;
