import type { HowItWorksStep } from "./HowItWorksButton";

interface FloatingHowItWorksProps {
  title: string;
  intro?: string;
  steps: HowItWorksStep[];
}

// Disabled platform-wide: "How it works" hints removed by user request.
export const FloatingHowItWorks = (_props: FloatingHowItWorksProps) => null;

export default FloatingHowItWorks;
