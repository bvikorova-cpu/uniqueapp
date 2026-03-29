import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MultiverseToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  index: number;
  badge?: string;
}

export const MultiverseToolCard = ({ icon: Icon, title, description, color, onClick, index, badge }: MultiverseToolCardProps) => {
  const colorMap: Record<string, string> = {
    violet: "from-violet-500/15 to-purple-500/15 border-violet-500/25 hover:border-violet-500/50",
    red: "from-red-500/15 to-rose-500/15 border-red-500/25 hover:border-red-500/50",
    amber: "from-amber-500/15 to-orange-500/15 border-amber-500/25 hover:border-amber-500/50",
    emerald: "from-emerald-500/15 to-teal-500/15 border-emerald-500/25 hover:border-emerald-500/50",
    blue: "from-blue-500/15 to-cyan-500/15 border-blue-500/25 hover:border-blue-500/50",
    pink: "from-pink-500/15 to-rose-500/15 border-pink-500/25 hover:border-pink-500/50",
    indigo: "from-indigo-500/15 to-blue-500/15 border-indigo-500/25 hover:border-indigo-500/50",
    cyan: "from-cyan-500/15 to-teal-500/15 border-cyan-500/25 hover:border-cyan-500/50",
  };

  const iconColorMap: Record<string, string> = {
    violet: "text-violet-400 bg-violet-500/20",
    red: "text-red-400 bg-red-500/20",
    amber: "text-amber-400 bg-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    pink: "text-pink-400 bg-pink-500/20",
    indigo: "text-indigo-400 bg-indigo-500/20",
    cyan: "text-cyan-400 bg-cyan-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`relative bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] backdrop-blur-sm group`}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
          {badge}
        </span>
      )}
      <div className={`p-2.5 rounded-xl ${iconColorMap[color]} w-fit mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};
