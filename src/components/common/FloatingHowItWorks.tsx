import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { HowItWorksButton, type HowItWorksStep } from "./HowItWorksButton";

interface FloatingHowItWorksProps {
  title: string;
  intro?: string;
  steps: HowItWorksStep[];
}

/**
 * Floating, portal-mounted "How it works" trigger. Renders fixed in the
 * top-right corner (below the navbar) so it can be dropped into any page
 * regardless of layout.
 */
export const FloatingHowItWorks = ({ title, intro, steps }: FloatingHowItWorksProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[60] top-[72px] right-3 sm:right-5"
      style={{ pointerEvents: "auto" }}
    >
      <HowItWorksButton title={title} intro={intro} steps={steps} variant="compact" />
    </div>,
    document.body,
  );
};

export default FloatingHowItWorks;
