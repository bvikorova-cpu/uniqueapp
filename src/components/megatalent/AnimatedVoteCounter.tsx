import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Animated Vote Counter - How it works"} steps={[{ title: 'Open', desc: 'Access the Animated Vote Counter section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Animated Vote Counter.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};

export default AnimatedVoteCounter;
