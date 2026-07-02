import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const QUESTIONS = [
  { id: "name",        q: "What's your pet's name?",                 type: "text" },
  { id: "species",     q: "What kind of animal?",                    type: "select", options: ["dog","cat","bird","rabbit","other"] },
  { id: "age",         q: "How old?",                                type: "select", options: ["puppy/kitten","young","adult","senior"] },
  { id: "personality", q: "Personality?",                            type: "select", options: ["playful","shy","calm","energetic","cuddly"] },
  { id: "main_goal",   q: "What do you want most help with?",        type: "select", options: ["understand emotions","training","health","just for fun"] },
];

export default function PetOnboardingQuiz({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [intro, setIntro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const q = QUESTIONS[step];
  const next = () => setStep((s) => s + 1);

  const finish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return toast.error("Sign in first"); }
    // Persist quiz
    await supabase.from("pet_quiz_responses").insert({ user_id: user.id, answers });
    // Auto-create pet profile if name given
    if (answers.name) {
      await supabase.from("pet_profiles").insert({
        user_id: user.id, name: answers.name, species: answers.species || "dog", personality: answers.personality,
      });
    }
    const { data } = await supabase.functions.invoke("pet-translator-ai", { body: { action: "onboarding_personalize", answers } });
    setIntro(data?.result || "Welcome!");
    setLoading(false);
  };

  if (intro) {
    return (
      <>
        <FloatingHowItWorks title="How Pet Onboarding Quiz works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <Card className="p-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Welcome!</h2>
        <p className="whitespace-pre-wrap text-sm">{intro}</p>
        <Button onClick={onDone} className="mt-4 w-full">Start translating</Button>
      </Card>
      </>
      );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <Progress value={((step) / QUESTIONS.length) * 100} className="mb-4" />
      <Label className="text-base font-semibold">{q.q}</Label>
      {q.type === "text" ? (
        <Input className="mt-3" value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {q.options!.map((opt) => (
            <Button key={opt} variant={answers[q.id] === opt ? "default" : "outline"} onClick={() => setAnswers({ ...answers, [q.id]: opt })}>{opt}</Button>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-5">
        {step > 0 ? <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button> : <span />}
        {step < QUESTIONS.length - 1 ? (
          <Button onClick={next} disabled={!answers[q.id]}>Next</Button>
        ) : (
          <Button onClick={finish} disabled={!answers[q.id] || loading}>{loading ? "…" : "Finish"}</Button>
        )}
      </div>
    </Card>
  );
}
