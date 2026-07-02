import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SkillSwapToolCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    badge: string;
    gradient: string;
    features: string[];
  };
  onSelect: () => void;
  index: number;
}

export const SkillSwapToolCard = ({ tool, onSelect, index }: SkillSwapToolCardProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Skill Swap Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Swap Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Swap Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card
        className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-xl border-border/50"
        onClick={onSelect}
      >
        <div className={`h-1 ${tool.gradient}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <tool.icon className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {tool.badge}
            </Badge>
          </div>
          <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
          <ul className="space-y-1.5">
            {tool.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
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
    </>
  );
};
