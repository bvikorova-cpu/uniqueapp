import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const QUESTIONS = [
  { q: "How do you prefer to communicate?", options: ["Short and direct", "Detailed and thoughtful", "Casual with humor", "Formal and professional"] },
  { q: "What's your energy level in conversations?", options: ["High energy & enthusiastic", "Calm & collected", "Playfully sarcastic", "Warm & empathetic"] },
  { q: "How do you handle disagreements?", options: ["Debate passionately", "Seek compromise", "Use humor to defuse", "Listen and reflect"] },
  { q: "What topics excite you most?", options: ["Technology & Science", "Arts & Culture", "Business & Finance", "Relationships & Psychology"] },
  { q: "Pick your ideal conversation setting:", options: ["Quick chat over coffee", "Deep late-night discussion", "Group brainstorm session", "One-on-one heart-to-heart"] },
];

const PERSONALITY_PROFILES: Record<string, string> = {
  "0,0,0,0,0": "The Efficient Innovator — You value speed, directness, and technical prowess. Your clone will be a no-nonsense conversationalist who cuts to the chase and loves exploring cutting-edge ideas.",
  "1,3,3,3,3": "The Thoughtful Connector — You're a deep thinker who values emotional intelligence and meaningful relationships. Your clone will be empathetic, reflective, and excel at heart-to-heart conversations.",
  "2,2,2,1,1": "The Creative Maverick — Humor and creativity define your style. Your clone will bring wit, cultural insights, and a fresh perspective to every conversation.",
  "3,1,1,2,2": "The Strategic Leader — Professional yet approachable, you blend business acumen with calm confidence. Your clone will be a composed, strategic thinker perfect for brainstorming sessions.",
};

const generateProfile = (answers: number[]): string => {
  const key = answers.join(",");
  if (PERSONALITY_PROFILES[key]) return PERSONALITY_PROFILES[key];
  
  const traits = [
    ["direct", "thoughtful", "humorous", "professional"][answers[0]],
    ["enthusiastic", "calm", "sarcastic", "empathetic"][answers[1]],
    ["passionate", "diplomatic", "witty", "reflective"][answers[2]],
    ["tech-savvy", "culturally aware", "business-minded", "emotionally intelligent"][answers[3]],
    ["efficient", "deep", "collaborative", "intimate"][answers[4]],
  ];
  
  return `Your Unique Profile — You're a ${traits[0]}, ${traits[1]} communicator who handles conflict with a ${traits[2]} approach. Your passion for ${["technology", "arts & culture", "business", "psychology"][answers[3]]} shines through in ${traits[4]} conversations. Your clone will mirror this distinctive personality blend.`;
};

export function ClonePersonalityQuiz() {
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [started, setStarted] = useState(false);

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      analyzeResults(newAnswers);
    }
  };

  const analyzeResults = async (finalAnswers: number[]) => {
    setIsAnalyzing(true);
    // Simulate brief analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResult(generateProfile(finalAnswers));
    setIsAnalyzing(false);
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setStarted(false);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Personality Clone Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!started ? (
          <div className="text-center py-8">
            <Brain className="h-16 w-16 mx-auto mb-4 text-primary/60" />
            <h3 className="text-lg font-bold mb-2">Discover Your Clone Personality</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Answer 5 quick questions to generate the perfect personality profile for your clone
            </p>
            <Button onClick={() => setStarted(true)}>
              <Sparkles className="h-4 w-4 mr-2" /> Start Quiz
            </Button>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Analyzing your personality...</p>
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
            <Badge className="mb-4">Your Clone Profile</Badge>
            <p className="text-sm text-foreground leading-relaxed mb-6 max-w-lg mx-auto bg-background/50 p-4 rounded-xl border border-border/50">{result}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={restart}>Retake Quiz</Button>
              <Button onClick={() => toast({ description: "Create Clone with Profile — coming soon" })}>
                <ArrowRight className="h-4 w-4 mr-2" /> Create Clone with Profile
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline">Question {currentQ + 1}/{QUESTIONS.length}</Badge>
                <div className="flex gap-1">
                  {QUESTIONS.map((_, i) => (
                    <div key={i} className={`w-8 h-1.5 rounded-full ${i <= currentQ ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-4">{QUESTIONS[currentQ].q}</h3>
              <div className="grid gap-3">
                {QUESTIONS[currentQ].options.map((opt, i) => (
                  <Button key={i} variant="outline" className="justify-start text-left h-auto py-3 px-4" onClick={() => handleAnswer(i)}>
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
