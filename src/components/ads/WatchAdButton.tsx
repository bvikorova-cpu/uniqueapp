import { Button } from "@/components/ui/button";
import { Play, Loader2, Clock } from "lucide-react";
import { useRewardedAd } from "@/hooks/useRewardedAd";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WatchAdButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  label?: string;
  xpAmount?: number;
}

export function WatchAdButton({
  className,
  variant = "default",
  size = "default",
  label,
  xpAmount = 25,
}: WatchAdButtonProps) {
  const { watchAd, isLoading, cooldownRemaining } = useRewardedAd();
  const onCooldown = cooldownRemaining > 0;
  const seconds = Math.ceil(cooldownRemaining / 1000);

  return (
    <>
      <FloatingHowItWorks title={"Watch Ad Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Watch Ad Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Watch Ad Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button
      onClick={watchAd}
      disabled={isLoading || onCooldown}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : onCooldown ? (
        <Clock className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {onCooldown ? `Wait ${seconds}s` : (label ?? `Watch ad +${xpAmount} XP`)}
    </Button>
    </>
  );
}
