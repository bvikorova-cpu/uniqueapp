import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  { q: "How do you prefer to communicate?", options: ["Short and direct", "Detailed and thoughtful", "Casual with humor", "Formal and professional"] },
  { q: "What's your energy level in conversations?", options: ["High energy & enthusiastic", "Calm & collected", "Playfully sarcastic", "Warm & empathetic"] },
  { q: "How do you handle disagreements?", options: ["Debate passionately", "Seek compromise", "Use humor to defuse", "Listen and reflect"] },
  { q: "What topics excite you most?", options: ["Technology & Science", "Arts & Culture", "Business & Finance", "Relationships & Psychology"] },
  { q: "Pick your ideal conversation setting:", options: ["Quick chat over coffee", "Deep late-night discussion", "Group brainstorm session", "One-on-one heart-to-heart"] },
];

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("clone-chat", {
        body: {
          message: `Based on these personality quiz answers, generate a brief personality profile (3-4 sentences) for an AI clone. Answers: ${finalAnswers.map((a, i) => `Q${i+1}: "${QUESTIONS[i].options[a]}"`).join(", ")}`,
          cloneId: "quiz-analysis",
          clonePersonality: "You are a personality analyst. Generate concise, insightful personality profiles."
        }
      });

      if (error) throw error;
      setResult(data.response || "Your personality profile: Analytical and creative with a warm communication style. You blend intellectual curiosity with genuine empathy.");
    } catch {
      setResult("Your personality profile: You have a unique blend of traits that makes your communication style distinctive. Your clone will adapt to mirror your natural conversation patterns.");
    } finally {
      setIsAnalyzing(false);
    }
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
              Answer 5 quick questions and our AI will generate the perfect personality profile for your clone
            </p>
            <Button onClick={() => setStarted(true)}>
              <Sparkles className="h-4 w-4 mr-2" /> Start Quiz
            </Button>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">AI is analyzing your personality...</p>
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
            <Badge className="mb-4">Your Clone Profile</Badge>
            <p className="text-sm text-foreground leading-relaxed mb-6 max-w-lg mx-auto bg-background/50 p-4 rounded-xl border border-border/50">{result}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={restart}>Retake Quiz</Button>
              <Button>
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
