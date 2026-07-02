import { motion } from "framer-motion";
import { FileWarning, ShieldCheck, Heart, Ambulance } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const steps = [
  { icon: FileWarning, title: "Report", desc: "Submit emergency case", color: "text-destructive" },
  { icon: ShieldCheck, title: "Verify", desc: "24h verification", color: "text-destructive" },
  { icon: Heart, title: "Fund", desc: "Community responds", color: "text-destructive" },
  { icon: Ambulance, title: "Relief", desc: "Immediate aid delivered", color: "text-destructive" },
];

export function CrisisStepsWizard() {
  return (
    <>
      <FloatingHowItWorks title={"Crisis Steps Wizard - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Steps Wizard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Steps Wizard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-10">
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
        <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-destructive/20 via-destructive/40 to-destructive/20 -translate-y-1/2" />
        <motion.div
          className="hidden md:block absolute top-1/2 left-[12%] h-0.5 bg-destructive -translate-y-1/2"
          initial={{ width: 0 }}
          whileInView={{ width: "76%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-card border border-destructive/20 flex items-center justify-center shadow-lg mb-2">
              <step.icon className={`w-6 h-6 ${step.color}`} />
            </div>
            <span className="font-bold text-sm text-foreground">{step.title}</span>
            <span className="text-xs text-muted-foreground max-w-[100px]">{step.desc}</span>
          </motion.div>
        ))}
      </div>
    </section>
    </>
  );
}
