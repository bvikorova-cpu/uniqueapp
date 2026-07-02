import { motion } from "framer-motion";
import { Check, X, Crown, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const features = [
  { name: "Bedtime Stories", free: "3/day", gold: "Unlimited" },
  { name: "Story Creator", free: "1/day", gold: "Unlimited" },
  { name: "Homework Helper", free: "2/day", gold: "Unlimited" },
  { name: "Drawing Buddy", free: "1/day", gold: "Unlimited" },
  { name: "Science Lab", free: false, gold: true },
  { name: "Reading Companion", free: false, gold: true },
  { name: "Coloring Pages", free: "5 templates", gold: "All templates" },
  { name: "Fairy Castles", free: false, gold: true },
  { name: "Character Chat", free: "3 msgs/day", gold: "Unlimited" },
  { name: "Child Profiles", free: "1", gold: "Up to 5" },
  { name: "Progress Reports", free: false, gold: true },
  { name: "Magic Library Portfolio", free: false, gold: true },
  { name: "Sleep Timer Controls", free: false, gold: true },
  { name: "Parental Analytics", free: false, gold: true },
  { name: "Priority Support", free: false, gold: true },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-medium">{value}</span>;
}

export function ComparisonTable() {
  return (
    <>
      <FloatingHowItWorks title={"Comparison Table - How it works"} steps={[{ title: 'Open', desc: 'Access the Comparison Table section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comparison Table.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-center mb-8">
        <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Free vs Gold Pass
        </span>
        {" "}Comparison
      </h2>

      <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl backdrop-blur-sm">
        {/* Header */}
        <div className="grid grid-cols-3 bg-muted/50">
          <div className="p-4 font-semibold text-sm text-muted-foreground">Feature</div>
          <div className="p-4 text-center font-semibold text-sm">Free</div>
          <div className="p-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              <Crown className="h-3.5 w-3.5" /> Gold Pass
            </div>
          </div>
        </div>

        {/* Rows */}
        {features.map((feature, i) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-3 ${
              i % 2 === 0 ? "bg-card/50" : "bg-muted/20"
            } hover:bg-primary/5 transition-colors`}
          >
            <div className="p-3.5 text-sm font-medium flex items-center gap-2">
              {feature.name}
            </div>
            <div className="p-3.5 text-center flex items-center justify-center">
              <CellValue value={feature.free} />
            </div>
            <div className="p-3.5 text-center flex items-center justify-center text-amber-600 dark:text-amber-400 font-semibold">
              <CellValue value={feature.gold} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
  );
}
