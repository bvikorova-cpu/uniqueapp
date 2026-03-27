import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

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
  { key: "career", label: "Career", emoji: "💼" },
  { key: "fitness", label: "Fitness", emoji: "💪" },
  { key: "mindset", label: "Mindset", emoji: "🧠" },
  { key: "relationships", label: "Relations", emoji: "❤️" },
];

export const ComparisonTable = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Feature</th>
                {areas.map(a => (
                  <th key={a.key} className="text-center py-2 px-2 font-medium">
                    <span className="text-lg">{a.emoji}</span>
                    <br />
                    <span className="text-[10px] text-muted-foreground">{a.label}</span>
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
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-2.5 pr-4 text-xs">{feature.name}</td>
                  {areas.map(a => (
                    <td key={a.key} className="text-center py-2.5 px-2">
                      {feature[a.key as keyof typeof feature] ? (
                        <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/20 mx-auto" />
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
  );
};
