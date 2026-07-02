import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AnonymousDateToolCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    credits: number | string;
    gradient: string;
    features: string[];
  };
  onSelect: () => void;
  index: number;
}

export const AnonymousDateToolCard = ({ tool, onSelect, index }: AnonymousDateToolCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <FloatingHowItWorks
        title={"Anonymous Date Tool Card"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Card
        className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-xl border-border/50"
        onClick={onSelect}
      >
        <div className={`h-1 ${tool.gradient}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <tool.icon className="h-5 w-5 text-pink-500" />
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {tool.credits} Credits
            </Badge>
          </div>
          <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
          <ul className="space-y-1.5">
            {tool.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-pink-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button size="sm" className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            Open
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
