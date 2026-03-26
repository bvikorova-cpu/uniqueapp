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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
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
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 text-xs">{feature.name}</td>
                  {areas.map(a => (
                    <td key={a.key} className="text-center py-2 px-2">
                      {feature[a.key as keyof typeof feature] ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
};
