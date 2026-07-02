import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TEMPLATES: Record<string, Array<{ question: string; emoji: string }>> = {
  math: [
    { question: "How do I solve 24 × 15?", emoji: "✖️" },
    { question: "What are fractions? Can you explain with pizza? 🍕", emoji: "🔢" },
    { question: "How do I find the area of a rectangle?", emoji: "📐" },
    { question: "What is the difference between odd and even numbers?", emoji: "🔄" },
  ],
  science: [
    { question: "Why does the moon change shape?", emoji: "🌙" },
    { question: "How do plants make food from sunlight?", emoji: "🌱" },
    { question: "What makes a rainbow appear?", emoji: "🌈" },
    { question: "How does a magnet work?", emoji: "🧲" },
  ],
  english: [
    { question: "What's the difference between 'their', 'there', and 'they're'?", emoji: "📝" },
    { question: "How do I write a good story beginning?", emoji: "✍️" },
    { question: "What are adjectives? Give me fun examples!", emoji: "🎨" },
    { question: "How do I use commas correctly?", emoji: "✏️" },
  ],
  history: [
    { question: "Who built the pyramids and why?", emoji: "🏛️" },
    { question: "What was life like for kids in the Middle Ages?", emoji: "🏰" },
    { question: "Why did dinosaurs go extinct?", emoji: "🦕" },
    { question: "Who invented the first computer?", emoji: "💻" },
  ],
  geography: [
    { question: "What are the 7 continents?", emoji: "🗺️" },
    { question: "Why do volcanoes erupt?", emoji: "🌋" },
    { question: "What's the deepest ocean?", emoji: "🌊" },
    { question: "How are mountains formed?", emoji: "🏔️" },
  ],
};

interface QuestionTemplatesProps {
  subject: string;
  onSelectTemplate: (question: string) => void;
}

export const QuestionTemplates = ({ subject, onSelectTemplate }: QuestionTemplatesProps) => {
  const templates = TEMPLATES[subject] || [];

  if (!subject || templates.length === 0) {
    return (
    <>
      <FloatingHowItWorks title={"Question Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Question Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Question Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="text-center py-4 text-sm text-muted-foreground">
        <span className="text-2xl block mb-2">👆</span>
        Select a subject to see quick question templates!
      </div>
    </>
  );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        ⚡ Quick Start Templates
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {templates.map((tmpl, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Button
              variant="outline"
              className="w-full text-left h-auto py-2.5 px-3 justify-start text-xs hover:border-primary/50 hover:bg-primary/5"
              onClick={() => onSelectTemplate(tmpl.question)}
            >
              <span className="text-lg mr-2">{tmpl.emoji}</span>
              <span className="truncate">{tmpl.question}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
