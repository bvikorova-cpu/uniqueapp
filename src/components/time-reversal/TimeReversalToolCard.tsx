import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TimeReversalToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  index: number;
  badge?: string;
}

const colorMap: Record<string, string> = {
  purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/60",
  violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400/60",
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/60",
  pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400/60",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/60",
  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/60",
  cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/60",
  indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400/60",
  orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/60",
  rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400/60",
  red: "from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400/60",
  fuchsia: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 hover:border-fuchsia-400/60",
};

const iconColorMap: Record<string, string> = {
  purple: "text-purple-400", violet: "text-violet-400", blue: "text-blue-400", pink: "text-pink-400",
  amber: "text-amber-400", emerald: "text-emerald-400", cyan: "text-cyan-400", indigo: "text-indigo-400",
  orange: "text-orange-400", rose: "text-rose-400", red: "text-red-400", fuchsia: "text-fuchsia-400",
};

export function TimeReversalToolCard({ icon: Icon, title, description, color, onClick, index, badge }: TimeReversalToolCardProps) {
  return (
    <>
      <FloatingHowItWorks title={"Time Reversal Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Time Reversal Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Time Reversal Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.purple} border backdrop-blur-sm text-left transition-all group active:scale-[0.97]`}
    >
      {badge && (
        <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 bg-purple-500 text-white border-0">{badge}</Badge>
      )}
      <div className={`w-9 h-9 rounded-lg bg-black/20 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColorMap[color] || "text-purple-400"}`} />
      </div>
      <h3 className="font-bold text-sm mb-1 text-foreground">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{description}</p>
    </motion.button>
    </>
  );
}
