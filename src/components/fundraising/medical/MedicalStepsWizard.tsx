import { motion } from "framer-motion";
import { FileText, ShieldCheck, CreditCard, CheckCircle } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const STEPS = [
  {
    icon: FileText,
    title: "Create Campaign",
    desc: "Submit medical info with diagnosis, hospital, and funding goal",
    color: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Admin Verification",
    desc: "Reviewed within 24 hours — only verified campaigns go live",
    color: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: CreditCard,
    title: "Receive Donations",
    desc: "Secure Stripe payments — one-time or monthly. 94% goes to you",
    color: "from-green-500/10 to-emerald-500/10",
    border: "border-green-500/20",
  },
  {
    icon: CheckCircle,
    title: "Get Treatment",
    desc: "Funds transferred directly to support medical treatment",
    color: "from-primary/10 to-accent/10",
    border: "border-primary/20",
  },
];

export function MedicalStepsWizard() {
  return (
    <>
      <FloatingHowItWorks title={"Medical Steps Wizard - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Steps Wizard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Steps Wizard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6 text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className={`relative bg-gradient-to-br ${step.color} border ${step.border} rounded-2xl p-4 text-center`}
            >
              {/* Step number */}
              <div className="absolute -top-2.5 -left-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shadow-md">
                {i + 1}
              </div>

              <div className="mx-auto w-10 h-10 rounded-xl bg-card/80 flex items-center justify-center mb-2">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{step.desc}</p>

              {/* Connector line on desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border/50" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
