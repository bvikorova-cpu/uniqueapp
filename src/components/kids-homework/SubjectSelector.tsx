import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SUBJECTS = [
  { id: "math", name: "Math", emoji: "📐", color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30", desc: "Numbers, equations & geometry" },
  { id: "science", name: "Science", emoji: "🔬", color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30", desc: "Nature, physics & biology" },
  { id: "english", name: "English", emoji: "📖", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30", desc: "Grammar, writing & vocabulary" },
  { id: "history", name: "History", emoji: "🏛️", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30", desc: "Past events & civilizations" },
  { id: "geography", name: "Geography", emoji: "🌍", color: "from-cyan-500/20 to-teal-500/20", border: "border-cyan-500/30", desc: "Countries, maps & nature" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", emoji: "😊", grades: "Grades 1-2" },
  { id: "medium", label: "Medium", emoji: "🤔", grades: "Grades 3-4" },
  { id: "hard", label: "Hard", emoji: "🧠", grades: "Grades 5-6" },
];

interface SubjectSelectorProps {
  selectedSubject: string;
  selectedDifficulty: string;
  onSubjectChange: (subject: string) => void;
  onDifficultyChange: (difficulty: string) => void;
}

export const SubjectSelector = ({
  selectedSubject,
  selectedDifficulty,
  onSubjectChange,
  onDifficultyChange,
}: SubjectSelectorProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Subject Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Subject Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Subject Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      {/* Subject cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🎯 Choose Your Subject
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SUBJECTS.map((sub, i) => (
            <motion.button
              key={sub.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSubjectChange(sub.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedSubject === sub.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md"
                  : `bg-gradient-to-br ${sub.color} ${sub.border}`
              }`}
            >
              <motion.span
                className="text-2xl sm:text-3xl block mb-1"
                animate={selectedSubject === sub.id ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {sub.emoji}
              </motion.span>
              <span className="text-xs font-bold text-foreground block">{sub.name}</span>
              <span className="text-[9px] text-muted-foreground hidden sm:block">{sub.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Difficulty selector */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🔥 Difficulty Level
        </h3>
        <div className="flex gap-2">
          {DIFFICULTIES.map((diff, i) => (
            <motion.button
              key={diff.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onDifficultyChange(diff.id)}
              className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                selectedDifficulty === diff.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border/50 bg-card/50 hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{diff.emoji}</span>
              <span className="text-xs font-bold text-foreground block">{diff.label}</span>
              <Badge variant="outline" className="text-[9px] mt-1">{diff.grades}</Badge>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
