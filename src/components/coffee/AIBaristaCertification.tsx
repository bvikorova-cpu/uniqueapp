import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, GraduationCap, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const AIBaristaCertification = ({ onBack }: { onBack: () => void }) => {
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    if (!level) { toast.error("Please select certification level"); return; }
    setLoading(true); setQuestions([]); setCurrentQ(0); setScore(0); setExamFinished(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "barista_exam", level }
      });
      if (error) throw error;
      
      // Parse questions from AI response
      const parsed = data?.questions || data?.result;
      if (Array.isArray(parsed)) {
        setQuestions(parsed);
      } else {
        // Fallback: generate structured questions
        const fallbackQuestions: Question[] = [
          { question: `What is the ideal water temperature for ${level === "Beginner" ? "pour over" : "espresso extraction"}?`, options: ["85-90°C", "90-96°C", "70-80°C", "100°C"], correct: 1, explanation: "The ideal temperature range for most coffee brewing is 90-96°C (195-205°F)." },
          { question: "What does 'single origin' mean?", options: ["One type of bean only", "Coffee from one geographic region", "Coffee picked by one person", "One roast batch"], correct: 1, explanation: "Single origin coffee comes from one specific region, farm, or country." },
          { question: "What is crema in espresso?", options: ["Added cream", "The golden foam layer on top", "A type of sugar", "Steamed milk"], correct: 1, explanation: "Crema is the golden-brown foam on top of a properly extracted espresso shot." },
          { question: "What is the standard espresso extraction time?", options: ["10-15 seconds", "25-30 seconds", "45-60 seconds", "5-8 seconds"], correct: 1, explanation: "A standard espresso shot should extract in about 25-30 seconds." },
          { question: "What causes coffee to taste sour?", options: ["Over-extraction", "Under-extraction", "Too much water", "Old beans"], correct: 1, explanation: "Sour coffee is typically caused by under-extraction — the water hasn't pulled enough flavor compounds." },
        ];
        setQuestions(fallbackQuestions);
      }
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error generating exam");
    } finally { setLoading(false); }
  };

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    setShowResult(true);
    if (idx === questions[currentQ].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setExamFinished(true);
      // Save result
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("activity_feed").insert({
            user_id: user.id,
            activity_type: "barista_certification",
            metadata: { level, score: score + (selected === questions[currentQ]?.correct ? 1 : 0), total: questions.length, date: new Date().toISOString() },
          });
        }
      })();
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const passRate = questions.length > 0 ? ((score / questions.length) * 100) : 0;
  const passed = passRate >= 70;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      
      {!questions.length && !examFinished && (
        <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-yellow-400" />
              AI Barista Certification
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">5 Credits</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Take an AI-generated barista exam and earn your certification badge</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {["Beginner", "Intermediate", "Expert"].map(l => (
                <motion.button
                  key={l}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLevel(l)}
                  className={`p-4 rounded-lg text-center transition-all border ${
                    level === l ? "border-yellow-500 bg-yellow-500/20" : "border-amber-500/10 bg-card hover:border-amber-500/30"
                  }`}
                >
                  <GraduationCap className={`h-6 w-6 mx-auto mb-1 ${level === l ? "text-yellow-400" : "text-muted-foreground"}`} />
                  <p className="text-xs font-semibold">{l}</p>
                </motion.button>
              ))}
            </div>

            <Button className="w-full bg-gradient-to-r from-yellow-600 to-amber-800" onClick={handleStartExam} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Exam...</> : "Start Certification Exam"}
            </Button>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && !examFinished && (
        <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Question {currentQ + 1}/{questions.length}</CardTitle>
              <span className="text-sm text-amber-400 font-bold">Score: {score}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{questions[currentQ].question}</p>
            <div className="space-y-2">
              {questions[currentQ].options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  disabled={showResult}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-3 rounded-lg text-left text-sm transition-all border ${
                    showResult
                      ? idx === questions[currentQ].correct
                        ? "border-green-500 bg-green-500/20 text-green-300"
                        : idx === selected
                          ? "border-red-500 bg-red-500/20 text-red-300"
                          : "border-amber-500/10 bg-card opacity-50"
                      : selected === idx
                        ? "border-amber-500 bg-amber-500/20"
                        : "border-amber-500/10 bg-card hover:border-amber-500/30"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {showResult && idx === questions[currentQ].correct && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                    {showResult && idx === selected && idx !== questions[currentQ].correct && <XCircle className="h-4 w-4 text-red-400" />}
                    {opt}
                  </span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                  <p className="text-amber-400 font-semibold mb-1">📝 Explanation</p>
                  <p className="text-muted-foreground">{questions[currentQ].explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {showResult && (
              <Button className="w-full" onClick={handleNext}>
                {currentQ + 1 >= questions.length ? "See Results" : "Next Question →"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {examFinished && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`border-2 ${passed ? "border-green-500" : "border-red-500"} bg-card/80 backdrop-blur-xl text-center p-8`}>
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${passed ? "text-yellow-400" : "text-muted-foreground"}`} />
            <h2 className="text-2xl font-black mb-2">{passed ? "🎉 Congratulations!" : "Keep Practicing!"}</h2>
            <p className="text-4xl font-black mb-2 text-amber-400">{score}/{questions.length}</p>
            <p className="text-muted-foreground mb-4">
              {passed ? `You passed the ${level} Barista Certification!` : `You need 70% to pass. You scored ${Math.round(passRate)}%.`}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setQuestions([]); setExamFinished(false); }}>Try Again</Button>
              <Button onClick={onBack}>Back to Hub</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
