import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  index: number;
  badge?: string;
}

const colorMap: Record<string, string> = {
  red: "bg-red-500/10 border-red-500/20 hover:border-red-500/40 text-red-500",
  violet: "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40 text-violet-500",
  blue: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 text-blue-500",
  amber: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 text-amber-500",
  pink: "bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40 text-pink-500",
  emerald: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-500",
  cyan: "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40 text-cyan-500",
  indigo: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-500",
  orange: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40 text-orange-500",
};

export const ConcertToolCard = ({ icon: Icon, title, description, color, onClick, index, badge }: Props) => {
  const c = colorMap[color] || colorMap.violet;

  return (
    <>
      <FloatingHowItWorks title="How Concert Tool Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.button
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index }}
      onClick={onClick}
      className={`relative rounded-xl border p-4 text-left transition-all active:scale-[0.97] ${c} cursor-pointer group`}
    >
      {badge && (
        <Badge className="absolute top-2 right-2 text-[10px] px-1.5 py-0 bg-primary/80 text-primary-foreground">
          {badge}
        </Badge>
      )}
      <Icon className="w-7 h-7 mb-2 group-hover:scale-110 transition-transform" />
      <h3 className="font-bold text-sm text-foreground leading-tight mb-1">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
    </motion.button>
    </>
    );
};
