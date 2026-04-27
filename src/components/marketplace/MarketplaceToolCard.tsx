import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, LucideIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface MarketplaceToolCardProps {
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

export const MarketplaceToolCard = ({ tool, onSelect, index }: MarketplaceToolCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4 }}
  >
    <Card
      className="group relative overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-card/80 backdrop-blur-xl border-border/50"
      onClick={onSelect}
    >
      <div className={`h-1.5 ${tool.gradient} transition-all duration-300 group-hover:h-2`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${tool.gradient} shadow-lg`}>
            <tool.icon className="h-5 w-5 text-white" />
          </div>
          <Badge variant="secondary" className="text-[10px] font-bold">{tool.badge}</Badge>
        </div>
        <h3 className="font-bold text-sm mb-1.5">{tool.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{tool.description}</p>
        <ul className="space-y-1.5 mb-4">
          {tool.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-primary flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button size="sm" variant="outline" className="w-full gap-2 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          Open Tool <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  </motion.div>
);
