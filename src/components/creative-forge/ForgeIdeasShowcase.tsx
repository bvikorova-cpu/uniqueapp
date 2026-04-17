import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const TIPS = [
  { icon: "📜", title: "Inspiration Library", desc: "Browse 10,000+ AI-generated examples sorted by style and era" },
  { icon: "🎭", title: "Character Bible Builder", desc: "Auto-generate consistent character profiles for your novels & screenplays" },
  { icon: "🎼", title: "Melody-to-Lyrics", desc: "Hum a tune, get matching lyrics in your chosen genre" },
  { icon: "🏆", title: "Weekly Writing Contests", desc: "Submit your best work, vote, win bonus credits & badges" },
  { icon: "📊", title: "Plot Heatmap", desc: "Visualize tension arcs across your screenplay or novel chapter" },
  { icon: "🎯", title: "Genre Benchmarks", desc: "Compare your draft to bestseller patterns (length, pacing, dialogue ratio)" },
  { icon: "🔄", title: "A/B Version Compare", desc: "See two AI variants side-by-side, vote for the best, AI learns your taste" },
  { icon: "💼", title: "Sell Your Work", desc: "Marketplace for finished scripts, lyrics, ad copy — Stripe payouts" },
];

export const ForgeIdeasShowcase = () => {
  return (
    <Card className="border-amber-700/30 bg-gradient-to-br from-[hsl(30,20%,10%)]/80 to-[hsl(0,30%,10%)]/80 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-100" style={{ fontFamily: "Georgia, serif" }}>
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Coming Soon — Feature Roadmap
        </CardTitle>
        <p className="text-xs text-amber-200/60">Vote in the community for what we build next</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-black/30 border border-amber-700/20 hover:border-amber-500/40 hover:bg-black/40 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-2xl group-hover:scale-110 transition-transform">{tip.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-amber-100 mb-0.5">{tip.title}</h4>
                  <p className="text-[11px] text-amber-200/60 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
