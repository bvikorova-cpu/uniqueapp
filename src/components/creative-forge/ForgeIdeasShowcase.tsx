import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb, Library, UserSquare2, Music2, Trophy,
  LineChart, Target, GitCompare, Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TIPS = [
  { icon: Library, title: "Inspiration Library", desc: "Browse 10,000+ AI-generated examples sorted by style and era" },
  { icon: UserSquare2, title: "Character Bible Builder", desc: "Auto-generate consistent character profiles for your novels & screenplays" },
  { icon: Music2, title: "Melody-to-Lyrics", desc: "Hum a tune, get matching lyrics in your chosen genre" },
  { icon: Trophy, title: "Weekly Writing Contests", desc: "Submit your best work, vote, win bonus credits & badges" },
  { icon: LineChart, title: "Plot Heatmap", desc: "Visualize tension arcs across your screenplay or novel chapter" },
  { icon: Target, title: "Genre Benchmarks", desc: "Compare your draft to bestseller patterns (length, pacing, dialogue ratio)" },
  { icon: GitCompare, title: "A/B Version Compare", desc: "See two AI variants side-by-side, vote for the best, AI learns your taste" },
  { icon: Store, title: "Sell Your Work", desc: "Marketplace for finished scripts, lyrics, ad copy — Stripe payouts" },
];

export const ForgeIdeasShowcase = () => {
  return (
    <>
      <FloatingHowItWorks title={"Forge Ideas Showcase - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Ideas Showcase section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Ideas Showcase.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-amber-700/30 bg-gradient-to-br from-[hsl(30,20%,10%)]/80 to-[hsl(0,30%,10%)]/80 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-100" style={{ fontFamily: "Georgia, serif" }}>
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Community Feature Roadmap
        </CardTitle>
        <p className="text-xs text-amber-200/60">Vote in the community for what we build next</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-black/30 border border-amber-700/20 hover:border-amber-500/40 hover:bg-black/40 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-700/40 to-rose-700/40 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4 text-amber-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-amber-100 mb-0.5">{tip.title}</h4>
                    <p className="text-[11px] text-amber-200/60 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
