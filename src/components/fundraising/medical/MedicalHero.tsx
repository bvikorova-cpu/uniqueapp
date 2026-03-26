import { motion } from "framer-motion";
import { Heart, Sparkles, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicalHeroProps {
  onCreateCampaign: () => void;
}

const floatingIcons = [
  { emoji: "💊", left: 4, top: 12 },
  { emoji: "🏥", left: 92, top: 8 },
  { emoji: "💉", left: 6, top: 72 },
  { emoji: "🩺", left: 90, top: 68 },
  { emoji: "❤️‍🩹", left: 2, top: 42 },
  { emoji: "🫀", left: 95, top: 38 },
];

const stats = [
  { icon: Heart, label: "Campaigns Funded", value: "—" },
  { icon: Users, label: "Donors", value: "—" },
  { icon: TrendingUp, label: "Total Raised", value: "—" },
  { icon: ShieldCheck, label: "Verified", value: "100%" },
];

export function MedicalHero({ onCreateCampaign }: MedicalHeroProps) {
  return (
    <section className="relative py-14 px-4 text-center overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-30"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/30"
        >
          <span className="text-4xl">🏥</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black mb-3">
          <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Medical Fundraising
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-4">
          Help people with serious health issues get the treatment they need
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground mb-6"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          All campaigns verified before going live
        </motion.div>

        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <Button size="lg" onClick={onCreateCampaign} className="active:scale-[0.97]">
            <Heart className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </div>

        <div className="flex justify-center gap-3 sm:gap-5 flex-wrap">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 border border-border/30"
            >
              <stat.icon className="w-4 h-4 text-primary shrink-0" />
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
