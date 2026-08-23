import { motion } from "framer-motion";
import { Trophy, LayoutGrid, Users, BookOpen, ArrowRight } from "lucide-react";

export type LuxeSection = "compete" | "categories" | "community" | "guide";

const SECTIONS: {
  id: LuxeSection;
  icon: typeof Trophy;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
}[] = [
  {
    id: "compete",
    icon: Trophy,
    eyebrow: "Step 01",
    title: "Enter the contest",
    desc: "Upload your clip or photo and let the community vote you to the top.",
    cta: "Upload & compete",
  },
  {
    id: "categories",
    icon: LayoutGrid,
    eyebrow: "Step 02",
    title: "Choose your stage",
    desc: "Music, dance, art, comedy and more — every category has its own winners.",
    cta: "Browse categories",
  },
  {
    id: "community",
    icon: Users,
    eyebrow: "Step 03",
    title: "Rise with the crowd",
    desc: "Stories, achievements, payouts and referral rewards in one lounge.",
    cta: "Open the lounge",
  },
  {
    id: "guide",
    icon: BookOpen,
    eyebrow: "Step 04",
    title: "Rules & prizes",
    desc: "How voting windows, weekly payouts and the quarterly grand prize work.",
    cta: "Read the rules",
  },
];

interface Props {
  active: LuxeSection;
  onChange: (s: LuxeSection) => void;
}

export default function MegatalentLuxeNav({ active, onChange }: Props) {
  return (
    <section className="my-8">
      <div className="text-center mb-6">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold font-semibold">
          The Megatalent stage
        </p>
        <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight">
          Four doors.{" "}
          <span className="bg-gradient-gold bg-clip-text text-transparent">One spotlight.</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          Pick a door below — the page stays calm, one section at a time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -4 }}
              aria-pressed={isActive}
              className={`group relative overflow-hidden rounded-3xl p-[1px] text-left transition-shadow ${
                isActive ? "shadow-gold" : "hover:shadow-gold"
              }`}
              style={{
                background: isActive
                  ? "var(--gradient-gold)"
                  : "linear-gradient(135deg, hsl(var(--border)) 0%, hsl(var(--border) / 0.2) 60%, hsl(var(--gold) / 0.45) 100%)",
              }}
            >
              <div
                className={`relative h-full rounded-[calc(1.5rem-1px)] p-5 backdrop-blur-xl ${
                  isActive ? "bg-card/95" : "bg-card/70"
                }`}
              >
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-gold opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />

                <div className="relative flex items-start justify-between gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                      isActive
                        ? "border-transparent bg-gradient-gold text-gold-foreground"
                        : "border-gold/25 bg-gold/10 text-gold"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground pt-1">
                    {s.eyebrow}
                  </span>
                </div>

                <h3 className="relative mt-4 text-lg font-black leading-tight">{s.title}</h3>
                <p className="relative mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>

                <span
                  className={`relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${
                    isActive ? "text-gold" : "text-foreground/70 group-hover:text-gold"
                  }`}
                >
                  {s.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>

                <span
                  className={`absolute bottom-0 left-5 right-5 h-px bg-gradient-gold transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
