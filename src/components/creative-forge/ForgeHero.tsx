import { motion } from "framer-motion";
import { Sparkles, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const floatingIcons = [
  { emoji: "🎵", left: 5, top: 14 },
  { emoji: "📖", left: 92, top: 9 },
  { emoji: "🎬", left: 4, top: 68 },
  { emoji: "✍️", left: 90, top: 62 },
  { emoji: "🎭", left: 3, top: 40 },
  { emoji: "🎤", left: 95, top: 36 },
  { emoji: "💡", left: 48, top: 5 },
];

interface ForgeHeroProps {
  credits: number;
  creditsLoading: boolean;
}

export function ForgeHero({ credits, creditsLoading }: ForgeHeroProps) {
  return (
    <section className="relative py-10 text-center overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-25"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/30"
        >
          <PenTool className="w-7 h-7 text-primary-foreground" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mb-2">
          <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            CreativeForge
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-4">
          AI-Powered Creative Writing Studio — from lyrics to screenplays
        </p>

        <div className="flex items-center justify-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            8 content types • Style references • Instant generation
          </motion.div>

          <Badge variant="outline" className="text-sm px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            {creditsLoading ? "..." : credits} Credits
          </Badge>
        </div>
      </motion.div>
    </section>
  );
}
