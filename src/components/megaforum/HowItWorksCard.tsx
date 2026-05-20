import { motion } from "framer-motion";
import { Eye, Lock, Sparkles, Crown } from "lucide-react";


export const HowItWorksCard = () => {
  const items = [
    {
      icon: Eye,
      title: "Browse",
      desc: "Free preview of posts",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Lock,
      title: "Interact",
      desc: "Login to post, like & vote",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Sparkles,
      title: "AI Tools",
      desc: "3–5 credits per use",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: Crown,
      title: "Premium",
      desc: "Subscription unlocks all",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 p-3 sm:p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {"How it works"}
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-start gap-2 p-2.5 rounded-lg ${item.bg} border ${item.border}`}
          >
            <div className={`flex-shrink-0 w-7 h-7 rounded-md ${item.bg} flex items-center justify-center`}>
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs leading-tight">{item.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
