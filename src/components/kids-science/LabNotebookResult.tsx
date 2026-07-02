import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FlaskConical, BookOpen, Lightbulb } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LabNotebookResultProps {
  result: {
    conclusion?: string;
    explanation?: string;
    funFacts?: string[];
  };
  category: string;
}

export const LabNotebookResult = ({ result, category: _category }: LabNotebookResultProps) => {
  const conclusion =
    result?.conclusion?.trim() || "The AI couldn't generate a conclusion. Please try again.";
  const explanation = result?.explanation?.trim() || "No explanation available.";
  const funFacts = Array.isArray(result?.funFacts)
    ? result.funFacts.filter((f) => typeof f === "string" && f.trim())
    : [];
  return (
    <>
      <FloatingHowItWorks title={"Lab Notebook Result - How it works"} steps={[{ title: 'Open', desc: 'Access the Lab Notebook Result section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lab Notebook Result.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Notebook header */}
      <div className="text-center">
        <motion.div
          className="text-5xl mb-2"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          📓
        </motion.div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Science Notebook
        </h2>
      </div>

      {/* Conclusion */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FlaskConical className="w-5 h-5" />
            Experiment Conclusion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-foreground leading-relaxed"
          >
            {conclusion}
          </motion.p>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
            Scientific Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground leading-relaxed"
          >
            {explanation}
          </motion.p>
        </CardContent>
      </Card>

      {/* Fun Facts */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
            <Sparkles className="w-4 h-4" />
            Fun Facts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funFacts.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No fun facts available.</p>
          ) : (
            <ul className="space-y-3">
              {funFacts.map((fact, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.15 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-amber-500/10"
                >
                  <span className="text-xl flex-shrink-0">
                    {["🌟", "💫", "⭐"][index % 3]}
                  </span>
                  <span className="text-foreground text-sm">{fact}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};