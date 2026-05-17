import { Card } from "@/components/ui/card";
import { Shield, Clock, AlertCircle } from "lucide-react";

interface Props {
  fundingMode: "all_or_nothing" | "keep_it_all" | string;
  currentAmount: number;
  targetAmount: number;
  endsAt?: string | null;
}

export function AllOrNothingBadge({ fundingMode, currentAmount, targetAmount, endsAt }: Props) {
  const isAON = fundingMode === "all_or_nothing";
  const reached = currentAmount >= targetAmount;

  const daysLeft = endsAt
    ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Card
      className={`p-4 border-2 ${
        isAON ? "border-accent/40 bg-accent/5" : "border-primary/40 bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        {isAON ? (
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        ) : (
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm mb-1">
            {isAON ? "All-or-Nothing Funding" : "Keep-It-All Funding"}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isAON
              ? reached
                ? "🎉 Goal reached! All pledges will be charged when the campaign ends."
                : "You'll only be charged if the campaign reaches its full goal. No risk."
              : "The creator keeps every donation, even if the goal isn't fully reached."}
          </p>
          {daysLeft !== null && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-foreground">
              <Clock className="w-3 h-3" />
              {daysLeft === 0 ? "Ends today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
