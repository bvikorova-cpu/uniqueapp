import { motion } from "framer-motion";
import { LucideIcon, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/fundraising-hub-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Stat { icon: LucideIcon; label: string; value: string | number; }

interface PremiumCategoryHeroProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaIcon?: LucideIcon;
  onCta: () => void;
  stats?: Stat[];
  accentColor?: "amber" | "rose" | "purple" | "cyan" | "emerald";
}

const accentMap: Record<string, { from: string; via: string; to: string; ring: string; stroke: string; chip: string }> = {
  amber:   { from: "from-amber-300",  via: "via-yellow-400",  to: "to-amber-300",  ring: "rgba(251,191,36,0.4)",  stroke: "rgba(251,191,36,0.4)",  chip: "border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.3)]" },
  rose:    { from: "from-rose-200",   via: "via-pink-300",    to: "to-rose-200",   ring: "rgba(244,63,94,0.4)",   stroke: "rgba(244,63,94,0.4)",   chip: "border-rose-400/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]" },
  purple:  { from: "from-purple-200", via: "via-fuchsia-300", to: "to-purple-200", ring: "rgba(168,85,247,0.4)",  stroke: "rgba(168,85,247,0.4)",  chip: "border-purple-400/40 shadow-[0_0_30px_rgba(168,85,247,0.3)]" },
  cyan:    { from: "from-cyan-200",   via: "via-sky-300",     to: "to-cyan-200",   ring: "rgba(34,211,238,0.4)",  stroke: "rgba(34,211,238,0.4)",  chip: "border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.3)]" },
  emerald: { from: "from-emerald-200",via: "via-green-300",   to: "to-emerald-200",ring: "rgba(16,185,129,0.4)",  stroke: "rgba(16,185,129,0.4)",  chip: "border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]" },
};

export function PremiumCategoryHero({
  badge, badgeIcon: BadgeIcon, title, subtitle, description,
  ctaLabel, ctaIcon: CtaIcon = Sparkles, onCta, stats = [], accentColor = "amber",
}: PremiumCategoryHeroProps) {
  const a = accentMap[accentColor];

  return (
    <>
      <FloatingHowItWorks title={"Premium Category Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Premium Category Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Premium Category Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className={`relative h-[60vh] min-h-[460px] w-full overflow-hidden rounded-3xl border ${a.chip.split(" ")[0]} mb-8 ${a.chip.split(" ")[1]}`}>
      <div className="absolute inset-0 bg-black" />
      <video className="absolute inset-0 h-full w-full object-cover brightness-[1.05] saturate-[1.15]" autoPlay muted loop playsInline>
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-rose-950/25 to-black/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/20 via-transparent to-purple-950/25" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-8 px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-xl text-white text-xs sm:text-sm font-semibold border ${a.chip.split(" ")[0]} drop-shadow-md`}>
            <BadgeIcon className="w-4 h-4" style={{ color: "#fde68a" }} />
            <span style={{ color: "#fde68a" }}>{badge}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-2 drop-shadow-lg"
          style={{
            WebkitTextStroke: "1.5px rgba(0,0,0,0.4)",
            textShadow: `0 0 50px ${a.ring}, 0 4px 20px rgba(0,0,0,0.6)`,
          }}
        >
          <span className={`bg-gradient-to-r ${a.from} ${a.via} ${a.to} bg-clip-text text-transparent`}>
            {title}
          </span>
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-center text-base sm:text-lg text-amber-100/90 font-semibold mb-3 drop-shadow-md"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-white/85 text-center mb-6 max-w-2xl mx-auto drop-shadow-md font-light"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex justify-center mb-5"
        >
          <Button
            size="lg"
            onClick={onCta}
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold border-0 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          >
            <CtaIcon className="mr-2 h-4 w-4" /> {ctaLabel}
          </Button>
        </motion.div>

        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="grid gap-3 max-w-3xl mx-auto w-full"
            style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))` }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className="bg-black/50 backdrop-blur-xl rounded-xl p-3 text-center border border-amber-400/20"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <s.icon className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-base sm:text-xl font-black text-white">{s.value}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-amber-100/70 font-medium uppercase tracking-wider">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-4 text-[11px] text-amber-100/60"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Verified · Secure · Transparent</span>
        </motion.div>
      </div>
    </div>
    </>
  );
}
