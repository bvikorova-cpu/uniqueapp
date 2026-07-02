import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  salaryMin?: number | null;
  salaryMax?: number | null;
  payRangeDisclosed?: boolean | null;
  equityRange?: string | null;
  bonusStructure?: string | null;
}

export function SalaryTransparencyBadge({ salaryMin, salaryMax, payRangeDisclosed, equityRange, bonusStructure }: Props) {
  let score = 0;
  if (salaryMin && salaryMax) score += 50;
  else if (salaryMin || salaryMax) score += 25;
  if (payRangeDisclosed) score += 20;
  if (equityRange) score += 15;
  if (bonusStructure) score += 15;

  const tier = score >= 80 ? { label: "Fully transparent", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", Icon: ShieldCheck }
              : score >= 50 ? { label: "Partially transparent", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", Icon: Eye }
              : { label: "Not disclosed", color: "bg-muted text-muted-foreground border-border", Icon: EyeOff };
  const Icon = tier.Icon;

  return (
    <>
      <FloatingHowItWorks title="How Salary Transparency Badge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${tier.color} text-[10px] gap-1`}>
            <Icon className="h-3 w-3" /> {tier.label} · {score}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="text-xs space-y-1 max-w-xs">
          <p>Salary range: {salaryMin && salaryMax ? `€${salaryMin}–€${salaryMax}` : "—"}</p>
          <p>Pay range disclosed: {payRangeDisclosed ? "Yes" : "No"}</p>
          <p>Equity: {equityRange || "—"}</p>
          <p>Bonus: {bonusStructure || "—"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    </>
    );
}
