import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingAssistantDockProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed-position container that stacks the three floating assistant triggers
 * (Uni, Live Chat, Translate) vertically on the right edge of the screen.
 * Keeps them from overlapping horizontally on small screens.
 */
export function FloatingAssistantDock({ children, className }: FloatingAssistantDockProps) {
  const { pathname } = useLocation();
  const isAiGeneration = pathname.startsWith("/ai-generation");

  return (
    <div
      className={cn(
        isAiGeneration
          ? "fixed bottom-[calc(12rem+env(safe-area-inset-bottom))] left-1 md:left-auto md:bottom-6 md:right-6 z-[9990]"
          : "fixed bottom-[calc(11rem+env(safe-area-inset-bottom))] right-1 md:bottom-6 md:right-6 z-[9990]",
        "flex flex-col-reverse items-end gap-1.5 md:gap-3 scale-75 origin-bottom-right md:scale-100",
        className
      )}
      aria-label="Assistant dock"
    >
      {children}
    </div>
  );
}
