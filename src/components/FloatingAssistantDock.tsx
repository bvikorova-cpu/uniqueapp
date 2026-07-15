import { ReactNode } from "react";
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
  return (
    <div
      className={cn(
        "fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 md:bottom-6 md:right-6 z-[9990]",
        "flex flex-col-reverse items-end gap-3",
        className
      )}
      aria-label="Assistant dock"
    >
      {children}
    </div>
  );
}
