import { motion } from "framer-motion";
import { Shield, CheckCircle, Eye, CreditCard, Lock, BadgeCheck } from "lucide-react";

const trustItems = [
  { icon: BadgeCheck, title: "Verified Campaigns", desc: "Every campaign goes through a strict verification process before going live", color: "text-green-500" },
  { icon: Lock, title: "Stripe Secure Payments", desc: "Bank-level encryption and PCI-DSS compliance for every transaction", color: "text-blue-500" },
  { icon: Eye, title: "100% Transparent Fees", desc: "You see exactly how much goes to the cause and how much to the platform", color: "text-primary" },
  { icon: Shield, title: "Fraud Protection", desc: "AI-powered monitoring and manual review to prevent misuse of funds", color: "text-accent" },
];

export const TrustSection = () => {
  return (
    <section className="py-10 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-2">
          <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">🛡️ Why Trust Us?</span>
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8">Your security and trust are our top priority</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-4 flex gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security badges */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {["Stripe Verified", "SSL Encrypted", "GDPR Compliant", "24/7 Support"].map((badge, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3 w-3 text-green-500" /> {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
