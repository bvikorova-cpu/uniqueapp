import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const features = [
  { name: "Daily Check-ins", career: true, fitness: true, mindset: true, relationships: true },
  { name: "Goal Setting & Tracking", career: true, fitness: true, mindset: true, relationships: true },
  { name: "Personalized Plans", career: true, fitness: true, mindset: true, relationships: false },
  { name: "Progress Analytics", career: true, fitness: true, mindset: false, relationships: false },
  { name: "Resume/Profile Review", career: true, fitness: false, mindset: false, relationships: false },
  { name: "Workout Plans", career: false, fitness: true, mindset: false, relationships: false },
  { name: "Nutrition Guidance", career: false, fitness: true, mindset: false, relationships: false },
  { name: "Meditation Exercises", career: false, fitness: false, mindset: true, relationships: false },
  { name: "Communication Tips", career: false, fitness: false, mindset: false, relationships: true },
  { name: "Conflict Resolution", career: false, fitness: false, mindset: false, relationships: true },
];

const areas = [
  { key: "career", label: "Career", emoji: "💼", color: "from-blue-500 to-cyan-500" },
  { key: "fitness", label: "Fitness", emoji: "💪", color: "from-green-500 to-emerald-500" },
  { key: "mindset", label: "Mindset", emoji: "🧠", color: "from-purple-500 to-violet-500" },
  { key: "relationships", label: "Relations", emoji: "❤️", color: "from-pink-500 to-rose-500" },
];

export const ComparisonTable = () => {
  return (
    <>
      <FloatingHowItWorks title="How Comparison Table works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Feature Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs">Feature</th>
                {areas.map(a => (
                  <th key={a.key} className="text-center py-2 px-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-lg shadow-sm`}>
                        {a.emoji}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-medium">{a.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.03 }}
                  className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                >
                  <td className="py-2.5 pr-4 text-xs font-medium">{feature.name}</td>
                  {areas.map(a => (
                    <td key={a.key} className="text-center py-2.5 px-2">
                      {feature[a.key as keyof typeof feature] ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/15 mx-auto" />
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
