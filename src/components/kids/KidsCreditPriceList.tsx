import { Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/** Server-side enforced credit prices for Kids modules (unified ai_credits). */
export const KIDS_CREDIT_PRICES: { label: string; cost: string }[] = [
  { label: "Homework Helper", cost: "3 credits / question" },
  { label: "Science Lab", cost: "3 credits / answer" },
  { label: "Story Creator", cost: "8 credits / story" },
  { label: "Story illustration", cost: "3 credits / page" },
  { label: "Story read-aloud (TTS)", cost: "2 credits / page" },
  { label: "Drawing Buddy", cost: "5 credits / drawing" },
  { label: "Coloring Page (AI)", cost: "3 credits / page" },
  { label: "Reading Companion", cost: "3 credits / analysis or quiz" },
  { label: "Word definition", cost: "1 credit" },
  { label: "Character Chat", cost: "1 credit / message" },
  { label: "Academy AI actions", cost: "3 credits / action" },
];

interface Props {
  /** Show the "Buy AI credits" button under the list. */
  showBuyButton?: boolean;
  className?: string;
}

/**
 * Always-visible price list of Kids AI features so parents/kids know
 * exactly what each action costs before using it.
 */
export function KidsCreditPriceList({ showBuyButton = true, className = "" }: Props) {
  const navigate = useNavigate();
  return (
    <div className={`rounded-xl border bg-card/80 backdrop-blur p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3 font-semibold">
        <Coins className="h-4 w-4 text-primary" /> Kids credit prices
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {KIDS_CREDIT_PRICES.map((p) => (
          <li
            key={p.label}
            className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
          >
            <span>{p.label}</span>
            <span className="font-semibold text-primary whitespace-nowrap">{p.cost}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground mt-3">
        No subscription needed — everything runs on the same AI credits used across the whole
        platform. Math games and free content stay open forever.
      </p>
      {showBuyButton && (
        <Button
          className="mt-4 w-full sm:w-auto font-semibold"
          onClick={() => navigate("/ai-credits")}
        >
          <Sparkles className="h-4 w-4 mr-2" /> Buy AI credits
        </Button>
      )}
    </div>
  );
}

export default KidsCreditPriceList;
