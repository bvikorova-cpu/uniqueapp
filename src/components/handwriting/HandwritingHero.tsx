import { motion } from "framer-motion";
import { Feather, FileText, Sparkles, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/handwriting-magnifier-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 40, inc = target / steps; let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 40);
    return (
    <>
      <FloatingHowItWorks title={"Handwriting Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(t);
  }, [target]);
  return <span>{target ? `${count.toLocaleString()}${suffix}` : "—"}</span>;
};

export const HandwritingHero = () => {
  const { stats, loading } = useLiveStats([
    { key: "users", table: "handwriting_credits" },
    { key: "analyses", table: "handwriting_analyses" },
  ]);

  const heroStats = [
    { icon: Feather, label: "Graphologists", value: stats.users || 0, suffix: "+" },
    { icon: FileText, label: "Manuscripts", value: stats.analyses || 0, suffix: "+" },
    { icon: ScrollText, label: "Engine", staticLabel: "GPT-4o" },
    { icon: Sparkles, label: "Avg time", staticLabel: "~8s" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-3xl border border-amber-900/20 mb-8"
    >
      {/* Hero video background */}
      <video
        src={heroVideo.url}
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Parchment + burgundy gradient overlay — lighter for brighter video */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(35_45%_25%/.55)] via-[hsl(15_55%_30%/.40)] to-[hsl(45_60%_40%/.35)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(45_85%_70%/.22),transparent_65%)]" />

      <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/10 border border-amber-300/30 backdrop-blur-sm text-sm text-amber-100 mb-5"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <Feather className="w-4 h-4" />
          <span className="tracking-wide">Vintage Calligraphy Atelier · AI Graphology</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 text-amber-50 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}
        >
          The Handwriting <span className="italic font-light text-amber-200">Atelier</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-amber-100/85 text-sm sm:text-lg max-w-2xl mx-auto mb-10 italic"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Where forensic AI meets centuries-old graphology. Reveal personality, mood, signatures,
          forgeries and historic kindred spirits — one stroke at a time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {heroStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="p-4 rounded-2xl bg-amber-50/8 backdrop-blur-md border border-amber-200/20"
            >
              <s.icon className="w-5 h-5 text-amber-200 mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-black text-amber-50" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {s.staticLabel ?? (loading ? "…" : <Counter target={s.value!} suffix={s.suffix} />)}
              </div>
              <p className="text-[11px] text-amber-100/70 mt-1 tracking-wide uppercase">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
