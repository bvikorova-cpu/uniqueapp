import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
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
  violet: "from-violet-500/20 to-violet-600/5 border-violet-500/30 hover:border-violet-400/60",
  purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30 hover:border-purple-400/60",
  pink: "from-pink-500/20 to-pink-600/5 border-pink-500/30 hover:border-pink-400/60",
  cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 hover:border-cyan-400/60",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-400/60",
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/60",
  red: "from-red-500/20 to-red-600/5 border-red-500/30 hover:border-red-400/60",
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-400/60",
  indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 hover:border-indigo-400/60",
  orange: "from-orange-500/20 to-orange-600/5 border-orange-500/30 hover:border-orange-400/60",
};

const iconColorMap: Record<string, string> = {
  violet: "text-violet-400", purple: "text-purple-400", pink: "text-pink-400",
  cyan: "text-cyan-400", amber: "text-amber-400", emerald: "text-emerald-400",
  red: "text-red-400", blue: "text-blue-400", indigo: "text-indigo-400", orange: "text-orange-400",
};

export const HolographicToolCard = ({ icon: Icon, title, description, color, onClick, index, badge }: Props) => {
  return (
    <>
      <FloatingHowItWorks title="How Holographic Tool Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border bg-gradient-to-br ${colorMap[color] || colorMap.violet} p-4 backdrop-blur-sm transition-all active:scale-[0.97] overflow-hidden group`}
    >
      {/* Holographic shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(168,85,247,0.08) 45%, rgba(236,72,153,0.08) 55%, transparent 70%)',
        }}
      />
      
      {badge && (
        <Badge className="absolute top-2 right-2 text-[10px] bg-primary/20 text-primary border-primary/30 px-1.5 py-0">
          {badge}
        </Badge>
      )}
      <div className={`w-9 h-9 rounded-lg bg-card/60 border border-border/40 flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 ${iconColorMap[color] || "text-primary"}`} />
      </div>
      <h3 className="font-bold text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
    </motion.div>
    </>
    );
};
