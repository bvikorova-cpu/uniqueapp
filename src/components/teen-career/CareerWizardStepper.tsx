import { motion } from "framer-motion";
import { Check, ClipboardList, Brain, Target, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CareerWizardStepperProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { icon: ClipboardList, label: "Quick Quiz" },
  { icon: Brain, label: "Your Profile" },
  { icon: Target, label: "Goals" },
  { icon: Sparkles, label: "Results" },
];

export const CareerWizardStepper = ({ currentStep, totalSteps }: CareerWizardStepperProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Career Wizard Stepper - How it works"} steps={[{ title: 'Open', desc: 'Access the Career Wizard Stepper section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Career Wizard Stepper.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {steps.slice(0, totalSteps).map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/30 text-muted-foreground/50"
                }`}
                animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </motion.div>
              <span className={`text-[10px] mt-1 font-medium ${
                isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground/50"
              }`}>
                {step.label}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 mx-1 rounded-full mb-4 ${
                isCompleted ? "bg-primary" : "bg-muted-foreground/20"
              }`} />
            )}
          </div>
        );
      })}
    </div>
    </>
  );
};
