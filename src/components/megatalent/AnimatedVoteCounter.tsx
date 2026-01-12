import { useEffect, useState, useRef } from "react";
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
  const [displayValue, setDisplayValue] = useState(targetValue - bonusVotes);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once when component mounts and user is TOP Premium
    if (isTopPremium && bonusVotes > 0 && !hasAnimated.current) {
      hasAnimated.current = true;
      setIsAnimating(true);
      setShowGlow(true);

      const baseValue = targetValue - bonusVotes;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      const startValue = baseValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.floor(startValue + (bonusVotes * easeOutCubic));
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(targetValue);
          setIsAnimating(false);
          // Keep glow for a bit longer
          setTimeout(() => setShowGlow(false), 1000);
        }
      };

      // Start animation after a short delay
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 500);
    } else {
      setDisplayValue(targetValue);
    }
  }, [targetValue, bonusVotes, isTopPremium]);

  return (
    <Badge 
      className={cn(
        "text-base font-bold transition-all duration-300",
        isTopPremium 
          ? "bg-gradient-to-r from-gold via-yellow-400 to-gold text-gold-foreground" 
          : "bg-gold text-gold-foreground",
        showGlow && "shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-105",
        isAnimating && "animate-pulse",
        className
      )}
    >
      <span className={cn(
        "transition-all",
        isAnimating && "text-white"
      )}>
        {displayValue.toLocaleString('en-US')}
      </span>
      {isTopPremium && isAnimating && (
        <span className="ml-1 text-xs animate-bounce">+100k</span>
      )}
    </Badge>
  );
};

export default AnimatedVoteCounter;
