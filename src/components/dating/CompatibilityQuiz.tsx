import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizAnswer { [key: string]: string }

const QUESTIONS = [
  { id: "lifestyle", q: "Your ideal Friday night?", opts: ["Cozy at home", "Dinner with friends", "Club & dancing", "Adventure outdoors"] },
  { id: "values", q: "What matters most to you?", opts: ["Family", "Career", "Freedom", "Growth"] },
  { id: "love_lang", q: "Your love language?", opts: ["Words", "Touch", "Quality time", "Gifts", "Acts of service"] },
  { id: "intent", q: "What are you looking for?", opts: ["Serious relationship", "Casual dating", "Marriage", "New friends"] },
  { id: "kids", q: "Children?", opts: ["Want kids", "Have kids", "Don't want", "Open to it"] },
  { id: "religion", q: "Religion role?", opts: ["Very important", "Somewhat", "Not important", "Spiritual not religious"] },
  { id: "politics", q: "Politics?", opts: ["Liberal", "Moderate", "Conservative", "Apolitical"] },
  { id: "drinks", q: "Drinking?", opts: ["Never", "Socially", "Often", "Trying to quit"] },
  { id: "smoke", q: "Smoking?", opts: ["Never", "Socially", "Regular", "Trying to quit"] },
  { id: "exercise", q: "Exercise?", opts: ["Daily", "Few times/week", "Sometimes", "Never"] },
];

interface Props {
  userId: string;
  initial?: QuizAnswer;
  onSaved?: (answers: QuizAnswer) => void;
}

export const CompatibilityQuiz = ({ userId, initial, onSaved }: Props) => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<QuizAnswer>(initial ?? {});
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (initial) setAnswers(initial); }, [initial]);

  const done = Object.keys(answers).length;
  const q = QUESTIONS[idx];
  const isLast = idx === QUESTIONS.length - 1;

  const pick = (opt: string) => {
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    if (!isLast) setIdx(idx + 1);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("dating_profiles")
      .update({ compatibility_quiz: answers as any })
      .eq("user_id", userId);
    setSaving(false);
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
    else { toast({ title: "Compatibility profile saved", description: `${done}/${QUESTIONS.length} answered` }); onSaved?.(answers); }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-primary" /> Compatibility Quiz
          <span className="ml-auto text-xs text-muted-foreground font-normal">{done}/{QUESTIONS.length}</span>
        </CardTitle>
        <Progress value={(done / QUESTIONS.length) * 100} className="h-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1 flex-wrap">
          {QUESTIONS.map((qq, i) => (
            <button key={qq.id} onClick={() => setIdx(i)}
              className={`h-2 w-6 rounded ${answers[qq.id] ? "bg-primary" : i === idx ? "bg-primary/40" : "bg-muted"}`} />
          ))}
        </div>
        <p className="font-medium text-sm">{q.q}</p>
        <div className="grid grid-cols-2 gap-2">
          {q.opts.map((o) => (
            <Button key={o} variant={answers[q.id] === o ? "default" : "outline"} size="sm"
              onClick={() => pick(o)} className="justify-start text-xs">
              {answers[q.id] === o && <Check className="h-3 w-3 mr-1" />} {o}
            </Button>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" size="sm" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Back</Button>
          <Button variant="ghost" size="sm" disabled={isLast} onClick={() => setIdx(idx + 1)}>Skip</Button>
          <Button size="sm" onClick={save} disabled={saving || done === 0} className="ml-auto">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const computeCompatibility = (a?: any, b?: any): number => {
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return 0;
  const keys = QUESTIONS.map(q => q.id);
  const overlap = keys.filter(k => a[k] && b[k]).length;
  if (!overlap) return 0;
  const matches = keys.filter(k => a[k] && a[k] === b[k]).length;
  return Math.round((matches / overlap) * 100);
};

export const QUIZ_QUESTIONS = QUESTIONS;
