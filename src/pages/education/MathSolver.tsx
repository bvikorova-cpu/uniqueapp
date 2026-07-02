import { useState } from "react";
import { useMathSolver } from "@/hooks/useEducationNotes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calculator, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useHomeworkCredits } from "@/hooks/useHomeworkCredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_MATHSOLVER_STEPS = [
  { title: 'Capture the problem', desc: 'Take a photo or type the equation.' },
  { title: 'See every step', desc: 'The solver explains each step, not just the answer.' },
  { title: 'Ask why', desc: 'Tap any step for a deeper explanation.' },
  { title: 'Save to Notes', desc: 'Push the solution to your Notes for later revision.' }
];
const __HIW_MATHSOLVER = { title: 'Math Solver', intro: 'Snap or type any math problem — get a step-by-step solution.', steps: __HIW_MATHSOLVER_STEPS };


export default function MathSolver() {
  const solve = useMathSolver();
  const credits = useHomeworkCredits();
  const [problem, setProblem] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [solution, setSolution] = useState<any>(null);

  const onSolve = async () => {
    const res = await solve.mutateAsync({ problem_text: problem, image_url: imageUrl || undefined });
    setSolution(res.solution);
    credits.refresh();
  };

  return (
    <>
      <FloatingHowItWorks title={__HIW_MATHSOLVER.title} intro={__HIW_MATHSOLVER.intro} steps={__HIW_MATHSOLVER.steps} />
      <Helmet><title>Math Solver · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-black">Math Solver</h1>
          <span className="ml-auto text-sm text-muted-foreground">{credits.credits_remaining} credits · 3 per solve</span>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 mb-6">
          <CardContent className="p-5 space-y-3">
            <Textarea placeholder="Type your problem... e.g. Solve 2x + 5 = 13" value={problem} onChange={(e) => setProblem(e.target.value)} />
            <Input placeholder="Or paste an image URL of the problem" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Button onClick={onSolve} disabled={solve.isPending || (!problem && !imageUrl)}>
              <Sparkles className="w-4 h-4 mr-1" /> {solve.isPending ? "Solving..." : "Solve step-by-step"}
            </Button>
          </CardContent>
        </Card>

        {solution && (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-5">
              <h2 className="font-black mb-4">Solution</h2>
              <ol className="space-y-3">
                {(solution.steps ?? []).map((s: any, i: number) => (
                  <li key={i} className="border-l-2 border-primary/40 pl-3">
                    <div className="font-bold text-sm">{s.title}</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{s.explanation}</div>
                    {s.latex && <code className="text-xs block mt-1 bg-muted px-2 py-1 rounded">{s.latex}</code>}
                  </li>
                ))}
              </ol>
              {solution.answer && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <span className="text-xs uppercase text-muted-foreground">Answer</span>
                  <div className="font-black text-lg">{solution.answer}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
