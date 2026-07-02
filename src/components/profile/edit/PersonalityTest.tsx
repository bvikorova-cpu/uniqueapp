import { useState } from "react";
import { Brain, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Question {
  id: string;
  q: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  { id: "energy", q: "On a free Saturday I'd rather…", options: [
    { value: "people", label: "Be with people, talk, dance" },
    { value: "alone", label: "Recharge alone with a book or game" },
    { value: "create", label: "Build / make / draw something" },
    { value: "explore", label: "Travel somewhere new" },
  ]},
  { id: "decisions", q: "When I make decisions, I trust…", options: [
    { value: "logic", label: "Logic & data" },
    { value: "gut", label: "Intuition" },
    { value: "values", label: "My values" },
    { value: "people", label: "What others think" },
  ]},
  { id: "vibe", q: "My vibe in 1 word", options: [
    { value: "calm", label: "Calm" },
    { value: "bold", label: "Bold" },
    { value: "curious", label: "Curious" },
    { value: "playful", label: "Playful" },
  ]},
  { id: "weekend", q: "Pick a weekend mood", options: [
    { value: "coffee", label: "Coffee + journaling" },
    { value: "club", label: "Club night & friends" },
    { value: "hike", label: "Mountain / nature" },
    { value: "studio", label: "Studio session / DIY" },
  ]},
  { id: "future", q: "In 5 years I want to be known for…", options: [
    { value: "creative", label: "Creative work" },
    { value: "leader", label: "Leadership / impact" },
    { value: "expert", label: "Mastery in my field" },
    { value: "freedom", label: "A free, balanced life" },
  ]},
];

interface Props {
  onApply: (result: { interests: string[]; tone: string; archetype: string; summary: string }) => void;
}

export const PersonalityTest = ({ onApply }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ archetype: string; summary: string; suggested_interests: string[]; suggested_tone: string } | null>(null);

  const choose = (val: string) => {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else submit(next);
  };

  const submit = async (final: Record<string, string>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("personality-test", { body: { answers: final } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      toast({ title: "Test error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const apply = () => {
    if (!result) return;
    onApply({
      interests: result.suggested_interests,
      tone: result.suggested_tone,
      archetype: result.archetype,
      summary: result.summary,
    });
    toast({ title: "Applied to your profile", description: result.archetype });
    setOpen(false);
    setStep(0); setAnswers({}); setResult(null);
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  if (!open) {
    return (
    <>
      <FloatingHowItWorks title={"Personality Test - How it works"} steps={[{ title: 'Open', desc: 'Access the Personality Test section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Personality Test.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-violet-900/30 via-card/40 to-fuchsia-900/30 backdrop-blur-xl p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-background" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">AI Personality Test</p>
              <p className="text-sm font-black bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent truncate">
                5 questions → autofill interests + tone of voice
              </p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-background font-bold">
            <Sparkles className="h-4 w-4 mr-1.5" /> Start
          </Button>
        </div>
      </div>
    </>
  );
  }

  return (
    <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-900/40 via-card/60 to-fuchsia-900/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <span className="ml-3 text-sm">Reading your vibe…</span>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Your archetype</p>
            <p className="text-2xl font-black bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
              {result.archetype}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
          </div>
          <div>
            <p className="text-xs font-bold mb-1.5">Suggested interests</p>
            <div className="flex flex-wrap gap-1.5">
              {result.suggested_interests.map((i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-400/40 text-violet-100">
                  {i}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-1.5">Suggested tone</p>
            <span className="text-xs px-2.5 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-100">
              {result.suggested_tone}
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={apply} className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-background font-bold">
              Apply to my profile
            </Button>
            <Button onClick={reset} variant="outline">Retake</Button>
            <Button onClick={() => setOpen(false)} variant="ghost">Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Question {step + 1} / {QUESTIONS.length}
            </p>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          </div>
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
          <h3 className="text-lg font-bold">{QUESTIONS[step].q}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUESTIONS[step].options.map((o) => (
              <button
                key={o.value}
                onClick={() => choose(o.value)}
                className="text-left p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-violet-500/10 hover:border-violet-400/40 transition-all flex items-center justify-between group"
              >
                <span className="text-sm font-medium">{o.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
