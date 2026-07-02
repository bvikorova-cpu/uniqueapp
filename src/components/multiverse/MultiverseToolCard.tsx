import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  const colorMap: Record<string, { bg: string; border: string; glow: string; icon: string; text: string }> = {
    violet: { bg: "from-violet-950/50 to-black/70", border: "border-violet-500/30 hover:border-violet-400/60", glow: "rgba(139,92,246,0.2)", icon: "text-violet-400 bg-violet-500/20 border-violet-500/30", text: "group-hover:text-violet-300" },
    red: { bg: "from-red-950/50 to-black/70", border: "border-red-500/30 hover:border-red-400/60", glow: "rgba(239,68,68,0.2)", icon: "text-red-400 bg-red-500/20 border-red-500/30", text: "group-hover:text-red-300" },
    amber: { bg: "from-amber-950/50 to-black/70", border: "border-amber-500/30 hover:border-amber-400/60", glow: "rgba(245,158,11,0.2)", icon: "text-amber-400 bg-amber-500/20 border-amber-500/30", text: "group-hover:text-amber-300" },
    emerald: { bg: "from-emerald-950/50 to-black/70", border: "border-emerald-500/30 hover:border-emerald-400/60", glow: "rgba(16,185,129,0.2)", icon: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30", text: "group-hover:text-emerald-300" },
    blue: { bg: "from-blue-950/50 to-black/70", border: "border-blue-500/30 hover:border-blue-400/60", glow: "rgba(59,130,246,0.2)", icon: "text-blue-400 bg-blue-500/20 border-blue-500/30", text: "group-hover:text-blue-300" },
    pink: { bg: "from-pink-950/50 to-black/70", border: "border-pink-500/30 hover:border-pink-400/60", glow: "rgba(236,72,153,0.2)", icon: "text-pink-400 bg-pink-500/20 border-pink-500/30", text: "group-hover:text-pink-300" },
    indigo: { bg: "from-indigo-950/50 to-black/70", border: "border-indigo-500/30 hover:border-indigo-400/60", glow: "rgba(99,102,241,0.2)", icon: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30", text: "group-hover:text-indigo-300" },
    cyan: { bg: "from-cyan-950/50 to-black/70", border: "border-cyan-500/30 hover:border-cyan-400/60", glow: "rgba(34,211,238,0.2)", icon: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30", text: "group-hover:text-cyan-300" },
    fuchsia: { bg: "from-fuchsia-950/50 to-black/70", border: "border-fuchsia-500/30 hover:border-fuchsia-400/60", glow: "rgba(217,70,239,0.2)", icon: "text-fuchsia-400 bg-fuchsia-500/20 border-fuchsia-500/30", text: "group-hover:text-fuchsia-300" },
    rose: { bg: "from-rose-950/50 to-black/70", border: "border-rose-500/30 hover:border-rose-400/60", glow: "rgba(244,63,94,0.2)", icon: "text-rose-400 bg-rose-500/20 border-rose-500/30", text: "group-hover:text-rose-300" },
  };

  const c = colorMap[color] || colorMap.violet;

  return (
    <>
      <FloatingHowItWorks title={"Multiverse Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Multiverse Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Multiverse Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 15 }}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`relative bg-gradient-to-br ${c.bg} ${c.border} border rounded-2xl p-4 cursor-pointer backdrop-blur-xl group overflow-hidden`}
      style={{ boxShadow: `0 0 15px ${c.glow}` }}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${c.glow}, transparent 70%)` }}
      />
      
      {badge && (
        <motion.span 
          className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          animate={{ boxShadow: ["0 0 5px rgba(34,211,238,0.2)", "0 0 12px rgba(34,211,238,0.4)", "0 0 5px rgba(34,211,238,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {badge}
        </motion.span>
      )}
      <div className="relative z-10">
        <div className={`p-2.5 rounded-xl ${c.icon} border w-fit mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className={`font-bold text-violet-50 text-sm mb-1 ${c.text} transition-colors`}>{title}</h3>
        <p className="text-xs text-violet-300/50 leading-relaxed">{description}</p>
      </div>
    </motion.div>
    </>
  );
};
