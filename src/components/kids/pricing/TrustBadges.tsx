import { motion } from "framer-motion";
import { Shield, Lock, CreditCard, RefreshCcw } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const badges = [
  { icon: Shield, label: "COPPA Compliant", desc: "Child privacy protected", color: "text-blue-500" },
  { icon: Lock, label: "256-bit Encryption", desc: "Bank-grade security", color: "text-green-500" },
  { icon: CreditCard, label: "Stripe Payments", desc: "Secure & trusted", color: "text-purple-500" },
  { icon: RefreshCcw, label: "14-Day Guarantee", desc: "Full money-back", color: "text-amber-500" },
];

export function TrustBadges() {
  return (
    <>
      <FloatingHowItWorks title={"Trust Badges - How it works"} steps={[{ title: 'Open', desc: 'Access the Trust Badges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trust Badges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm text-center"
        >
          <div className={`p-2.5 rounded-full bg-muted/50 ${badge.color}`}>
            <badge.icon className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold">{badge.label}</p>
          <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
        </motion.div>
      ))}
    </div>
    </>
  );
}
