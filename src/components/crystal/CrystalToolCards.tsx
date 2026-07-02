import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  Sparkles, Heart, Gem, BookOpen, Store, Upload, Timer, Palette,
  Brain, Compass, Users, BarChart3, Zap, Sun, Moon, Eye,
  Camera, Music, Globe, MessageCircle, Trophy, Package
} from "lucide-react";

const tools = [
  { icon: Sparkles, name: "AI Energy Reading", description: "AI detects your energy from photos", gradient: "from-violet-500 to-purple-400", bgGlow: "bg-violet-500/10", isPaid: true },
  { icon: Heart, name: "Energy Healing", description: "Personalized energy healing sessions", gradient: "from-pink-500 to-rose-400", bgGlow: "bg-pink-500/10", isPaid: true },
  { icon: Gem, name: "Chakra Balancing", description: "Complete 7-chakra alignment program", gradient: "from-indigo-500 to-violet-400", bgGlow: "bg-indigo-500/10", isPaid: true },
  { icon: BookOpen, name: "Crystal Encyclopedia", description: "500+ crystal profiles & knowledge base", gradient: "from-cyan-500 to-blue-400", bgGlow: "bg-cyan-500/10", isPaid: true },
  { icon: Store, name: "Crystal Marketplace", description: "Buy & sell authentic crystals", gradient: "from-emerald-500 to-green-400", bgGlow: "bg-emerald-500/10" },
  { icon: Upload, name: "Crystal Scanner", description: "Upload & identify any crystal instantly", gradient: "from-orange-500 to-amber-400", bgGlow: "bg-orange-500/10", isPaid: true },
  { icon: Palette, name: "Crystal Collection", description: "Manage your personal crystal collection", gradient: "from-teal-500 to-cyan-400", bgGlow: "bg-teal-500/10" },
  { icon: Sun, name: "Daily Crystal Oracle", description: "Daily crystal card with mantra & guidance", gradient: "from-yellow-500 to-amber-400", bgGlow: "bg-yellow-500/10" },
  { icon: Users, name: "Crystal Compatibility", description: "AI crystal compatibility between people", gradient: "from-rose-500 to-pink-400", bgGlow: "bg-rose-500/10", isPaid: true },
  { icon: Timer, name: "Meditation Timer", description: "Crystal frequency meditation sessions", gradient: "from-purple-500 to-fuchsia-400", bgGlow: "bg-purple-500/10" },
  { icon: Brain, name: "Aura Analysis", description: "Deep AI aura pattern detection", gradient: "from-blue-500 to-indigo-400", bgGlow: "bg-blue-500/10", isPaid: true },
  { icon: Compass, name: "Crystal Guide", description: "Step-by-step healing journey paths", gradient: "from-green-500 to-emerald-400", bgGlow: "bg-green-500/10" },
  { icon: BarChart3, name: "Energy Analytics", description: "Track your energy levels over time", gradient: "from-sky-500 to-blue-400", bgGlow: "bg-sky-500/10" },
  { icon: Moon, name: "Moon Phase Crystals", description: "Crystal recommendations by moon phase", gradient: "from-slate-500 to-gray-400", bgGlow: "bg-slate-500/10" },
  { icon: Eye, name: "Third Eye Training", description: "Guided intuition development exercises", gradient: "from-fuchsia-500 to-purple-400", bgGlow: "bg-fuchsia-500/10", isPaid: true },
  { icon: Zap, name: "Energy Cleansing", description: "Crystal cleansing & charging rituals", gradient: "from-amber-500 to-yellow-400", bgGlow: "bg-amber-500/10" },
  { icon: Camera, name: "Live Crystal ID", description: "Real-time camera crystal identification", gradient: "from-red-500 to-orange-400", bgGlow: "bg-red-500/10", isPaid: true },
  { icon: Music, name: "Crystal Sound Bath", description: "Audio healing with crystal frequencies", gradient: "from-violet-500 to-indigo-400", bgGlow: "bg-violet-500/10" },
  { icon: Globe, name: "Crystal Origin Map", description: "Interactive global crystal origin explorer", gradient: "from-blue-500 to-teal-400", bgGlow: "bg-blue-500/10" },
  { icon: MessageCircle, name: "Crystal Community", description: "Social network for crystal healers", gradient: "from-pink-500 to-fuchsia-400", bgGlow: "bg-pink-500/10" },
  { icon: Trophy, name: "Energy Leaderboard", description: "Gamified rankings & energy achievements", gradient: "from-yellow-500 to-orange-400", bgGlow: "bg-yellow-500/10" },
  { icon: Package, name: "Crystal Sub Box", description: "Monthly AI-curated crystal subscription", gradient: "from-emerald-500 to-teal-400", bgGlow: "bg-emerald-500/10", isPaid: true },
];

interface CrystalToolCardsProps {
  onSelectTool: (tool: string) => void;
}

export const CrystalToolCards = ({ onSelectTool }: CrystalToolCardsProps) => {
  return (
    <>
      <FloatingHowItWorks
        title='Crystal Tool Cards'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Crystal Tool Cards panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="mb-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Crystal & Energy Tools
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          22 powerful tools for energy healing, crystal analysis, and spiritual growth
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
          >
            <Card
              className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group active:scale-[0.97] relative overflow-hidden"
              onClick={() => onSelectTool(tool.name)}
            >
              {tool.isPaid && (
                <Badge className="absolute top-2 right-2 bg-accent/90 text-accent-foreground text-[9px] px-1.5 py-0.5">
                  Paid
                </Badge>
              )}
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${tool.bgGlow} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center opacity-90`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-1 text-foreground">{tool.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{tool.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
