import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, Sparkles } from "lucide-react";

interface Props {
  category?: string;
}

interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  emoji: string;
  cta: string;
  url: string;
  prize: string;
}

// Curated sponsor pool per category cluster
const SPONSOR_POOL: Record<string, Sponsor[]> = {
  art: [
    { id: "a1", name: "Wacom Studio", tagline: "Draw without limits", description: "Get up to 30% off pen tablets for talents on Unique.", gradient: "from-purple-600 to-pink-600", emoji: "🎨", cta: "Claim discount", url: "#", prize: "€500 voucher" },
    { id: "a2", name: "Canvas & Co.", tagline: "Premium art supplies", description: "Top 3 weekly winners win a full canvas starter pack.", gradient: "from-rose-500 to-orange-500", emoji: "🖼️", cta: "Visit shop", url: "#", prize: "Starter pack" },
  ],
  music: [
    { id: "m1", name: "SoundForge", tagline: "Mix like a pro", description: "Free 3-month studio license for verified musicians.", gradient: "from-indigo-600 to-cyan-500", emoji: "🎧", cta: "Get license", url: "#", prize: "3-month Pro" },
    { id: "m2", name: "MicroMic", tagline: "Studio-grade USB mics", description: "Winner of monthly award gets a flagship condenser mic.", gradient: "from-fuchsia-600 to-violet-600", emoji: "🎤", cta: "Learn more", url: "#", prize: "€399 mic" },
  ],
  dance: [
    { id: "d1", name: "FlexWear", tagline: "Dance in motion", description: "20% off pro dancewear for Unique creators.", gradient: "from-pink-500 to-rose-500", emoji: "💃", cta: "Shop now", url: "#", prize: "20% off" },
  ],
  sports: [
    { id: "s1", name: "PowerFuel", tagline: "Fuel your training", description: "Free 30-day supply for top 10 athletes of the month.", gradient: "from-emerald-500 to-lime-500", emoji: "💪", cta: "Claim", url: "#", prize: "30-day pack" },
  ],
  entertainment: [
    { id: "e1", name: "Streamly", tagline: "Go viral faster", description: "Free Pro plan for top 20 comedy creators monthly.", gradient: "from-amber-500 to-rose-500", emoji: "🎬", cta: "Activate", url: "#", prize: "Pro 1 month" },
  ],
  education: [
    { id: "ed1", name: "BrainBoost", tagline: "Learn anything", description: "Free annual subscription for the most viewed educator weekly.", gradient: "from-blue-600 to-cyan-500", emoji: "🧠", cta: "Get access", url: "#", prize: "1 year free" },
  ],
};

const DEFAULT_SPONSORS: Sponsor[] = [
  { id: "g1", name: "Unique Pro", tagline: "Become a creator", description: "Unlock unlimited uploads, AI tools and Top Premium badge.", gradient: "from-primary to-accent", emoji: "✨", cta: "Upgrade", url: "#", prize: "TOP Premium" },
  { id: "g2", name: "Sponsor your brand here", tagline: "Reach 100k+ talents", description: "Featured placement on every category page. Limited slots.", gradient: "from-slate-700 to-slate-900", emoji: "🏷️", cta: "Become sponsor", url: "#", prize: "From €299/wk" },
];

export default function MegatalentSponsorShowcase({ category }: Props) {
  const sponsors = (category && SPONSOR_POOL[category]) || DEFAULT_SPONSORS;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % sponsors.length), 6000);
    return () => clearInterval(t);
  }, [sponsors.length]);

  const s = sponsors[idx];

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Sponsored</span>
          <Badge variant="outline" className="ml-auto text-[9px] gap-0.5 px-1.5 py-0">
            <Sparkles className="h-2.5 w-2.5" />
            Partner
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className={`relative bg-gradient-to-br ${s.gradient} p-4 text-white`}
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl bg-white/15 backdrop-blur rounded-xl p-2 shrink-0">
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-black text-lg">{s.name}</h3>
                  <span className="text-xs text-white/80 italic">{s.tagline}</span>
                </div>
                <p className="text-sm text-white/90 mt-1">{s.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/70">Prize</p>
                <p className="text-sm font-bold">{s.prize}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-black hover:bg-white/90 gap-1.5"
                onClick={() => window.open(s.url, "_blank")}
              >
                {s.cta}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            {sponsors.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {sponsors.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === idx ? "w-4 bg-white" : "w-1 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
