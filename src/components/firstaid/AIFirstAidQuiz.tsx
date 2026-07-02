import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Question { question: string; options: string[]; correct: number; explanation: string; }

export function AIFirstAidQuiz({ onBack }: Props) {
  const [topic, setTopic] = useState("general");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Generate exactly 5 first aid quiz questions about "${topic}". Return ONLY valid JSON array: [{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]. correct is 0-based index. No markdown, no extra text.`
        }
      });
      if (error) throw error;
      const text = data?.message || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setQuestions(parsed);
        setCurrentQ(0); setScore(0); setSelected(null); setFinished(false);
      } else { toast.error("Could not parse quiz"); }
    } catch { toast.error("Quiz generation failed"); }
    finally { setLoading(false); }
  };

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[currentQ].correct) setScore(s => s + 1);
  };

  const next = () => {
    if (currentQ + 1 >= questions.length) { setFinished(true); return; }
    setCurrentQ(c => c + 1); setSelected(null);
  };

  const q = questions[currentQ];

  return (
    <>
      <FloatingHowItWorks title={"A I First Aid Quiz - How it works"} steps={[{ title: 'Open', desc: 'Access the A I First Aid Quiz section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I First Aid Quiz.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-red-500" />AI First Aid Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 && !loading && (
            <>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General First Aid</SelectItem>
                  <SelectItem value="cpr">CPR & Resuscitation</SelectItem>
                  <SelectItem value="bleeding">Bleeding & Wounds</SelectItem>
                  <SelectItem value="burns">Burns & Scalds</SelectItem>
                  <SelectItem value="fractures">Fractures & Sprains</SelectItem>
                  <SelectItem value="children">Pediatric First Aid</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={generate} className="w-full bg-red-600 hover:bg-red-700">Start Quiz (3 Credits)</Button>
            </>
          )}
          {loading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-red-500" /><span className="ml-2">Generating quiz...</span></div>}
          {q && !finished && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Question {currentQ + 1}/{questions.length}</p>
              <p className="font-semibold text-lg">{q.question}</p>
              <div className="grid gap-2">
                {q.options.map((opt, i) => (
                  <Button key={i} variant="outline" onClick={() => answer(i)}
                    className={`justify-start text-left h-auto py-3 ${selected === null ? "" : i === q.correct ? "border-green-500 bg-green-50 dark:bg-green-950" : i === selected ? "border-red-500 bg-red-50 dark:bg-red-950" : ""}`}>
                    {selected !== null && i === q.correct && <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />}
                    {selected !== null && i === selected && i !== q.correct && <XCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />}
                    {opt}
                  </Button>
                ))}
              </div>
              {selected !== null && <p className="text-sm bg-muted p-3 rounded">{q.explanation}</p>}
              {selected !== null && <Button onClick={next} className="w-full">{currentQ + 1 >= questions.length ? "See Results" : "Next Question"}</Button>}
            </div>
          )}
          {finished && (
            <div className="text-center py-8 space-y-4">
              <p className="text-4xl font-bold text-red-600">{score}/{questions.length}</p>
              <p className="text-lg">{score >= 4 ? "🏆 Excellent!" : score >= 3 ? "👍 Good job!" : "📚 Keep learning!"}</p>
              <Button onClick={() => { setQuestions([]); setFinished(false); }} variant="outline">Try Another Topic</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
