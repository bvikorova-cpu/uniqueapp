import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface InfluKingToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  credits?: number;
  gradient: string;
  iconColor: string;
  onClick: () => void;
  delay?: number;
}

export function InfluKingToolCard({ icon: Icon, title, description, badge, credits, gradient, iconColor, onClick, delay = 0 }: InfluKingToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-cyan-500/20 bg-gradient-to-br ${gradient} p-4 hover:border-cyan-400/40 transition-all group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
      <div className="relative z-10">
        <div className={`p-2 rounded-lg bg-background/30 w-fit mb-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex gap-1.5 mt-2">
          {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30">{badge}</span>}
          {credits !== undefined && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">{credits} credits</span>}
        </div>
      </div>
    </motion.div>
  );
}
