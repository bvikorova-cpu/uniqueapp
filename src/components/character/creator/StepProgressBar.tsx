import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Step {
  label: string;
  emoji: string;
}

const STEPS: Step[] = [
  { label: "Identity", emoji: "📝" },
  { label: "Appearance", emoji: "🎨" },
  { label: "Powers", emoji: "⚡" },
  { label: "Personality", emoji: "⭐" },
];

interface StepProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepProgressBar({ currentStep, onStepClick }: StepProgressBarProps) {
  return (
    <>
      <FloatingHowItWorks title={"Step Progress Bar - How it works"} steps={[{ title: 'Open', desc: 'Access the Step Progress Bar section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Step Progress Bar.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-6">
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8" />
        <motion.div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-8"
          initial={false}
          animate={{ width: `${(currentStep / (STEPS.length - 1)) * (100 - 10)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {STEPS.map((step, i) => (
          <motion.button
            key={i}
            onClick={() => onStepClick(i)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative z-10 flex flex-col items-center gap-1"
          >
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                i <= currentStep
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
              animate={i === currentStep ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {step.emoji}
            </motion.div>
            <span
              className={`text-[10px] font-semibold ${
                i <= currentStep ? "text-purple-700" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
}
