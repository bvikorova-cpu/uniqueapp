import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle, CreditCard } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TRUST_ITEMS = [
  { icon: Shield, title: "Verified Campaigns", desc: "All campaigns are reviewed before going live" },
  { icon: Lock, title: "Secure Payments", desc: "Your payment data is encrypted and protected" },
  { icon: CreditCard, title: "Powered by Stripe", desc: "Industry-standard payment processing" },
  { icon: CheckCircle, title: "Transparent Tracking", desc: "See exactly where your money goes" },
];

export function TrustSection() {
  return (
    <>
      <FloatingHowItWorks title={"Trust Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Trust Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trust Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">Why Trust Us</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-4 rounded-2xl bg-card/60 border border-border/30"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
