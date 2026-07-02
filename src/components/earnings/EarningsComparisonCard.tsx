import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  thisMonth: number;
  lastMonth: number;
}

/** Month-over-month earnings delta with directional indicator. */
export function EarningsComparisonCard({ thisMonth, lastMonth }: Props) {
  const delta = thisMonth - lastMonth;
  const pct = lastMonth > 0 ? (delta / lastMonth) * 100 : thisMonth > 0 ? 100 : 0;
  const up = delta >= 0;

  return (
    <>
      <FloatingHowItWorks title={"Earnings Comparison Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Comparison Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Comparison Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">This month vs last</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black">€{thisMonth.toFixed(2)}</span>
          <Badge variant={up ? "default" : "destructive"} className="gap-1">
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Last month: €{lastMonth.toFixed(2)} · Difference €{delta.toFixed(2)}
        </p>
      </CardContent>
    </Card>
    </>
  );
}
