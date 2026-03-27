import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const floatingIcons = [
  { emoji: "🔥", left: 5, top: 14 },
  { emoji: "🌊", left: 91, top: 9 },
  { emoji: "🌪️", left: 4, top: 68 },
  { emoji: "🆘", left: 89, top: 62 },
  { emoji: "⚠️", left: 3, top: 40 },
  { emoji: "🚨", left: 94, top: 36 },
  { emoji: "🏥", left: 48, top: 6 },
];

const stats = [
  { icon: Zap, label: "Active Crises", value: "—" },
  { icon: Users, label: "People Helped", value: "—" },
  { icon: TrendingUp, label: "Funds Deployed", value: "—" },
];

export function CrisisHero() {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 text-center overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-30"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 3 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Pulsing emergency beacon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 hsl(var(--destructive) / 0.4)", "0 0 0 20px hsl(var(--destructive) / 0)", "0 0 0 0 hsl(var(--destructive) / 0)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-destructive via-destructive/80 to-destructive/60 flex items-center justify-center"
        >
          <span className="text-4xl">🚨</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mb-3">
          <span className="bg-gradient-to-r from-foreground via-destructive to-destructive/60 bg-clip-text text-transparent">
            Crisis Relief Platform
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          Rapid emergency response — every minute counts when disaster strikes
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 backdrop-blur-sm border border-destructive/20 text-sm text-destructive mb-6"
        >
          <AlertTriangle className="w-4 h-4" />
          Verified within 24h — funds released immediately
        </motion.div>

        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <Button size="lg" variant="destructive" onClick={() => navigate("/fundraising/crisis/create")}>
            <AlertTriangle className="mr-2 h-4 w-4" /> Report Emergency
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" })}>
            <Sparkles className="mr-2 h-4 w-4" /> View Active Crises
          </Button>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/30"
            >
              <stat.icon className="w-4 h-4 text-destructive" />
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
