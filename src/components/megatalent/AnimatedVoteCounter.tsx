import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnimatedVoteCounterProps {
  targetValue: number;
  bonusVotes: number;
  isTopPremium: boolean;
  className?: string;
}

export const AnimatedVoteCounter = ({
  targetValue,
  bonusVotes,
  isTopPremium,
  className,
}: AnimatedVoteCounterProps) => {
  return (
    <Badge
      className={cn(
        "text-base font-bold transition-all duration-300",
        isTopPremium
          ? "bg-gradient-to-r from-gold via-yellow-400 to-gold text-gold-foreground"
          : "bg-gold text-gold-foreground",
        className
      )}
    >
      {targetValue.toLocaleString('en-US')}
    </Badge>
  );
};

export default AnimatedVoteCounter;
