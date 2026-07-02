import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface FootballToolCardProps {
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

export function FootballToolCard({ icon: Icon, title, description, badge, credits, gradient, iconColor, onClick, delay = 0 }: FootballToolCardProps) {
  return (
    <><FloatingHowItWorks title="FootballToolCard — How it works" steps={[{title:"Open this section",desc:"Access FootballToolCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-emerald-500/20 bg-gradient-to-br ${gradient} p-4 hover:border-emerald-400/40 transition-all group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 transition-all duration-300" />
      <div className="relative z-10">
        <div className={`p-2 rounded-lg bg-background/30 w-fit mb-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex gap-1.5 mt-2">
          {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">{badge}</span>}
          {credits !== undefined && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">{credits} credits</span>}
        </div>
      </div>
    </motion.div>
  </>
  );
}
