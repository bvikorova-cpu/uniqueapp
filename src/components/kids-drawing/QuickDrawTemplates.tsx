import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Template {
  id: string;
  title: string;
  emoji: string;
  topic: string;
  difficulty: string;
  steps: number;
  color: string;
}

const TEMPLATES: Template[] = [
  { id: "1", title: "Easy Cat", emoji: "🐱", topic: "cat", difficulty: "easy", steps: 4, color: "from-orange-500/20 to-yellow-500/20" },
  { id: "2", title: "Simple Star", emoji: "⭐", topic: "star", difficulty: "easy", steps: 3, color: "from-yellow-500/20 to-amber-500/20" },
  { id: "3", title: "Cute Robot", emoji: "🤖", topic: "robot", difficulty: "easy", steps: 4, color: "from-blue-500/20 to-cyan-500/20" },
  { id: "4", title: "Fun Rocket", emoji: "🚀", topic: "rocket", difficulty: "medium", steps: 5, color: "from-purple-500/20 to-pink-500/20" },
  { id: "5", title: "Cool Dragon", emoji: "🐉", topic: "dragon", difficulty: "medium", steps: 6, color: "from-red-500/20 to-orange-500/20" },
  { id: "6", title: "Pretty Flower", emoji: "🌸", topic: "flower", difficulty: "easy", steps: 4, color: "from-pink-500/20 to-rose-500/20" },
  { id: "7", title: "Magic Unicorn", emoji: "🦄", topic: "unicorn", difficulty: "hard", steps: 7, color: "from-violet-500/20 to-purple-500/20" },
  { id: "8", title: "Happy Dog", emoji: "🐶", topic: "dog", difficulty: "easy", steps: 4, color: "from-amber-500/20 to-yellow-500/20" },
];

interface Props {
  onSelectTemplate: (topic: string, difficulty: string) => void;
  loading?: boolean;
}

export const QuickDrawTemplates = ({ onSelectTemplate, loading }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Quick Draw Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Quick Draw Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Quick Draw Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Draw Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Button
                variant="outline"
                className={`w-full h-auto flex flex-col p-4 gap-1 bg-gradient-to-br ${t.color} hover:shadow-lg transition-all`}
                onClick={() => onSelectTemplate(t.topic, t.difficulty)}
                disabled={loading}
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-sm font-semibold">{t.title}</span>
                <span className="text-xs text-muted-foreground">
                  {t.steps} steps • {t.difficulty}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
