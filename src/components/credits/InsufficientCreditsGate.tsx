import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  balance: number;
  required: number;
  /** What the user was trying to do, e.g. "generate this video" */
  action?: string;
  /** Optional override of the top-up route */
  topUpHref?: string;
}

/**
 * Blocking message shown when balance < required.
 * Renders nothing if the user has enough credits.
 */
export const InsufficientCreditsGate = ({
  balance,
  required,
  action,
  topUpHref = "/ai-credits",
}: Props) => {
  const navigate = useNavigate();
  if (balance >= required) return null;

  return (
    <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 p-5 backdrop-blur-xl">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-base">Not enough credits</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {action
              ? `You need ${required} credits to ${action}, but you only have ${balance}.`
              : `This action requires ${required} credits — you currently have ${balance}.`}{" "}
            Top up or pick a subscription to keep going.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate(topUpHref)} className="gap-2">
          <Sparkles className="h-4 w-4" /> Top up credits
        </Button>
        <Button variant="outline" onClick={() => navigate("/pricing")}>
          See subscriptions
        </Button>
      </div>
    </div>
  );
};
