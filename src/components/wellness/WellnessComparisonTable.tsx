import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const features = [
  { name: "Breathing Exercises", basic: true, premium: true },
  { name: "5-4-3-2-1 Grounding", basic: true, premium: true },
  { name: "Nature Sounds", basic: true, premium: true },
  { name: "Body Scan Meditation", basic: true, premium: true },
  { name: "Sleep Stories", basic: true, premium: true },
  { name: "Daily Challenges", basic: true, premium: true },
  { name: "AI Mindfulness Coach", basic: false, premium: true },
  { name: "Gratitude Journal + AI", basic: false, premium: true },
  { name: "Digital Mandala", basic: false, premium: true },
  { name: "Progress Dashboard", basic: true, premium: true },
];

export const WellnessComparisonTable = () => {
  return (
    <>
      <FloatingHowItWorks title={"Wellness Comparison Table - How it works"} steps={[{ title: 'Open', desc: 'Access the Wellness Comparison Table section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wellness Comparison Table.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Feature Comparison</CardTitle>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">🌊</div>
              <span className="text-xs font-semibold">Basic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">👑</div>
              <span className="text-xs font-semibold">Premium</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {features.map((feature, i) => (
              <div key={feature.name} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                <span className="text-xs text-muted-foreground">{feature.name}</span>
                <div className="flex gap-6">
                  {feature.basic ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-muted-foreground/30" />
                  )}
                  {feature.premium ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-muted-foreground/30" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
