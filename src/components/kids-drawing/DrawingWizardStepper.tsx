import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  currentStep: number;
  steps: string[];
}

export const DrawingWizardStepper = ({ currentStep, steps }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Drawing Wizard Stepper - How it works"} steps={[{ title: 'Open', desc: 'Access the Drawing Wizard Stepper section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drawing Wizard Stepper.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;

        return (
          <div key={i} className="flex items-center gap-1 sm:gap-2">
            <motion.div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : isDone
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {isDone ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 ${isDone ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
    </>
  );
};
