import type { ReactNode } from "react";

export interface HowItWorksStep {
  title: string;
  desc?: string;
  description?: string;
}

interface HowItWorksButtonProps {
  title: string;
  intro?: string;
  steps: HowItWorksStep[];
  footer?: ReactNode;
  variant?: "icon" | "compact";
  className?: string;
}

// Disabled platform-wide: "How it works" hints removed by user request.
export const HowItWorksButton = (_props: HowItWorksButtonProps) => null;

export default HowItWorksButton;
