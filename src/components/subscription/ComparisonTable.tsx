import { Check, X, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const FEATURES = [
  { label: "Bazaar listings / month", basic: "5", premium: "Unlimited", business: "Unlimited" },
  { label: "Auctions / month", basic: "5", premium: "Unlimited", business: "Unlimited" },
  { label: "Sales commission", basic: "3%", premium: "0%", business: "0% forever" },
  { label: "AI generations / month", basic: "20", premium: "50", business: "Unlimited" },
  { label: "Featured listings", basic: false, premium: "3 / month", business: "Unlimited" },
  { label: "Priority support", basic: false, premium: true, business: true },
  { label: "Analytics dashboard", basic: false, premium: true, business: true },
  { label: "Custom branding", basic: false, premium: false, business: true },
  { label: "API access", basic: false, premium: false, business: true },
  { label: "Dedicated account manager", basic: false, premium: false, business: true },
];

const renderCell = (val: string | boolean) => {
  if (val === true) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
  if (val === false) return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-semibold">{val}</span>;
};

export const ComparisonTable = () => {
  return (
    <>
      <FloatingHowItWorks title={"Comparison Table - How it works"} steps={[{ title: 'Open', desc: 'Access the Comparison Table section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comparison Table.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 max-w-5xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">Compare every feature</h2>
        <p className="text-muted-foreground">Find the plan that fits your ambition.</p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-4 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border-b border-border/60">
          <div className="p-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Feature</div>
          <div className="p-4 text-center text-sm font-bold">Basic</div>
          <div className="p-4 text-center text-sm font-bold flex items-center justify-center gap-1.5">
            <Crown className="h-4 w-4 text-primary" /> Premium
          </div>
          <div className="p-4 text-center text-sm font-bold">Business</div>
        </div>
        {FEATURES.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-4 items-center ${
              i % 2 === 0 ? "bg-background/20" : ""
            } hover:bg-primary/5 transition-colors`}
          >
            <div className="p-4 text-sm">{row.label}</div>
            <div className="p-4 text-center">{renderCell(row.basic)}</div>
            <div className="p-4 text-center bg-primary/5">{renderCell(row.premium)}</div>
            <div className="p-4 text-center">{renderCell(row.business)}</div>
          </div>
        ))}
      </div>
    </motion.div>
    </>
  );
};
