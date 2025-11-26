import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useAnimations } from "@/contexts/AnimationContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const AnimationToggle = () => {
  const { animationsEnabled, toggleAnimations } = useAnimations();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAnimations}
            className="border-2 border-violet-600/50 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
            aria-label={animationsEnabled ? "Disable animations" : "Enable animations"}
          >
            {animationsEnabled ? (
              <Sparkles className="h-4 w-4 animate-pulse" />
            ) : (
              <Zap className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{animationsEnabled ? "Disable animations" : "Enable animations"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {animationsEnabled ? "Better performance & accessibility" : "More visual effects"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
