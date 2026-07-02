import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TimeCapsuleToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  index: number;
  badge?: string;
}

const colorMap: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/60",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/60",
  cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/60",
  violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400/60",
  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/60",
  pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400/60",
  orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/60",
  indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400/60",
  rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400/60",
};

const iconColorMap: Record<string, string> = {
  blue: "text-blue-500", amber: "text-amber-500", cyan: "text-cyan-500",
  violet: "text-violet-500", emerald: "text-emerald-500", pink: "text-pink-500",
  orange: "text-orange-500", indigo: "text-indigo-500", rose: "text-rose-500",
};

export const TimeCapsuleToolCard = ({ icon: Icon, title, description, color, onClick, index, badge }: TimeCapsuleToolCardProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Time Capsule Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Time Capsule Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Time Capsule Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl p-4 bg-gradient-to-br ${colorMap[color] || colorMap.blue} border backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg group`}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
          {badge}
        </span>
      )}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className={`w-5 h-5 ${iconColorMap[color] || "text-primary"}`} />
        </div>
        <h3 className="font-bold text-sm leading-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{description}</p>
      </div>
    </motion.div>
    </>
  );
};
