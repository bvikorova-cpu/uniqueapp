import { HowItWorksButton, type HowItWorksStep } from "./HowItWorksButton";

interface FloatingHowItWorksProps {
  title: string;
  intro?: string;
  steps: HowItWorksStep[];
}

/**
 * Contextual "How it works" trigger. It renders in-place where the section
 * asks for it instead of being portal-mounted globally over every screen.
 */
export const FloatingHowItWorks = ({ title, intro, steps }: FloatingHowItWorksProps) => {
  return (
    <div
      data-floating-hiw
      className="col-span-full mb-3 flex justify-end [body[data-scroll-locked]_&]:hidden"
    >
      <HowItWorksButton title={title} intro={intro} steps={steps} variant="compact" />
    </div>
  );
};

export default FloatingHowItWorks;
