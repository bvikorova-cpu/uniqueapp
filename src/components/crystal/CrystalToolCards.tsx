import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { Sparkles, Heart, Sun, Brain, Coins } from "lucide-react";

const tools = [
  { icon: Sparkles, name: "AI Energy Reading", description: "AI detects your energy from photos", gradient: "from-violet-500 to-purple-400", bgGlow: "bg-violet-500/10", cost: 3 },
  { icon: Heart, name: "Energy Healing", description: "Personalized energy healing sessions", gradient: "from-pink-500 to-rose-400", bgGlow: "bg-pink-500/10", cost: 3 },
  { icon: Sun, name: "Daily Crystal Oracle", description: "Daily crystal card with mantra & guidance", gradient: "from-yellow-500 to-amber-400", bgGlow: "bg-yellow-500/10", cost: 3 },
  { icon: Brain, name: "Aura Analysis", description: "Deep AI aura pattern detection", gradient: "from-blue-500 to-indigo-400", bgGlow: "bg-blue-500/10", cost: 3 },
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
          4 focused AI tools for energy healing and crystal guidance. Each AI tool costs 3 credits.
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
              <Badge className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 gap-0.5 ${tool.cost > 0 ? "bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Coins className="w-3 h-3" />
                {tool.cost > 0 ? `${tool.cost} cr` : "Free"}
              </Badge>
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
