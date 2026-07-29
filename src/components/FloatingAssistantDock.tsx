import { ReactNode, useEffect, useState } from "react";
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
  const [hideForMobile, setHideForMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    return viewportWidth < 1024 || window.matchMedia("(hover: none), (pointer: coarse)").matches;
  });

  useEffect(() => {
    const update = () => {
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      setHideForMobile(
        viewportWidth < 1024 || window.matchMedia("(hover: none), (pointer: coarse)").matches
      );
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  if (hideForMobile) return null;

  return (
    <div
      data-floating-assistant-dock="true"
      className={cn(
        "hidden lg:fixed lg:bottom-6 lg:right-6 lg:z-[9990] lg:flex",
        "flex-col-reverse items-end gap-1.5 md:gap-3 scale-75 origin-bottom-right md:scale-100",
        className
      )}
      aria-label="Assistant dock"
    >
      {children}
    </div>
  );
}
