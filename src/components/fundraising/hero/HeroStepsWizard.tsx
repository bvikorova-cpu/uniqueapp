import { motion } from "framer-motion";
import { Shield, CheckCircle, Heart, Megaphone } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const steps = [
  { icon: Megaphone, title: "Nominate", description: "Create a campaign for a local hero or organization", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: CheckCircle, title: "Verify", description: "Admin verifies organization legitimacy within 24h", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Heart, title: "Fund", description: "Community and corporate sponsors contribute", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Shield, title: "Impact", description: "Heroes receive 95% of funds for their projects", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export const HeroStepsWizard = () => {
  return (
    <>
      <FloatingHowItWorks title={"Hero Steps Wizard - How it works"} steps={[{ title: 'Open', desc: 'Access the Hero Steps Wizard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hero Steps Wizard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground"
      >
        How It Works
      </motion.h2>

      <div className="relative">
        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-border">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-500"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className={`${step.bg} w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50`}>
                <step.icon className={`h-8 w-8 md:h-10 md:w-10 ${step.color}`} />
              </div>
              <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">{step.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        <strong>Only 5% fee</strong> — the lowest across all categories. Heroes receive 95% directly.
      </motion.p>
    </div>
    </>
  );
};
