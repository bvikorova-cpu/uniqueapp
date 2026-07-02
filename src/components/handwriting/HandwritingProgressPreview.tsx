import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const progressItems = [
  { label: "Personal Analyses", value: 0, max: 10, color: "bg-primary" },
  { label: "Professional Analyses", value: 0, max: 5, color: "bg-accent" },
  { label: "Relationship Analyses", value: 0, max: 3, color: "bg-pink-500" },
];

export const HandwritingProgressPreview = () => {
  return (
    <>
      <FloatingHowItWorks title={"Handwriting Progress Preview - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Progress Preview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Progress Preview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {progressItems.map((item, i) => (
          <div key={item.label}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground font-medium">{item.value}/{item.max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.max) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
    </>
  );
};
