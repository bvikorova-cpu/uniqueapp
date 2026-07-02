import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BillingToggleProps {
  yearly: boolean;
  onChange: (yearly: boolean) => void;
}

export const BillingToggle = ({ yearly, onChange }: BillingToggleProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Billing Toggle - How it works"} steps={[{ title: 'Open', desc: 'Access the Billing Toggle section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Billing Toggle.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex justify-center mb-10">
      <div className="relative inline-flex items-center gap-1 p-1.5 rounded-full bg-card/60 backdrop-blur-xl border border-border/60 shadow-lg">
        <button
          onClick={() => onChange(false)}
          className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            !yearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange(true)}
          className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
            yearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Yearly
          <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black">
            -20%
          </span>
        </button>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute inset-y-1.5 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-md"
          style={{
            left: yearly ? "50%" : "0.375rem",
            right: yearly ? "0.375rem" : "50%",
          }}
        />
      </div>
    </div>
    </>
  );
};
