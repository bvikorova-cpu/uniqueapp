import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Loader2, Copy, Check, Sparkles, HelpCircle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 5;

interface Props { onBack: () => void; }

export function AIQuizGeneratorView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isLoading: creditsLoading, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast({ title: "Missing Topic", description: "Please enter a course topic", variant: "destructive" });
      return;
    }
    
    const ok = await checkAndDeduct(CREDITS_COST);
    if (!ok) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-quiz', topic, numQuestions: parseInt(numQuestions), difficulty }
      });
      if (error) throw error;
      setQuiz(data.result);
      toast({ title: "Quiz Generated!", description: `${numQuestions} questions created (${CREDITS_COST} credits used)` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate quiz", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(typeof quiz === 'string' ? quiz : JSON.stringify(quiz, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Quiz Generator View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Quiz Generator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Quiz Generator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Quiz Generator</h2>
            <p className="text-muted-foreground">Auto-generate quizzes from any course topic</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />5 Credits
          </Badge>
        </div>

        {/* Tips */}
        <Card className="mb-4 border-amber-500/20 bg-amber-500/5">
          <CardContent className="py-3 px-4">
            <div className="flex gap-2 items-start">
              <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><strong>Tips:</strong> Be specific with topics (e.g., "JavaScript Closures and Scope" vs "JavaScript"). Higher difficulty generates more nuanced questions.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-pink-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Course Topic</label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., JavaScript Promises and Async/Await" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Number of Questions</label>
                <select value={numQuestions} onChange={e => setNumQuestions(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <Button onClick={generateQuiz} disabled={loading} className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Quiz...</> : <><Brain className="w-4 h-4 mr-2" />Generate Quiz (5 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {quiz && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />Generated Quiz
              </CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">
                {typeof quiz === 'string' ? quiz : JSON.stringify(quiz, null, 2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}