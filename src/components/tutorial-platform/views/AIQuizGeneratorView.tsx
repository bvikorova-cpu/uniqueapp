import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export function AIQuizGeneratorView({ onBack }: Props) {
  const { toast } = useToast();
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
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-quiz', topic, numQuestions: parseInt(numQuestions), difficulty }
      });
      if (error) throw error;
      setQuiz(data.result);
      toast({ title: "Quiz Generated!", description: `${numQuestions} questions created (5 credits used)` });
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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-pink-500" />
          <div>
            <h2 className="text-2xl font-black">AI Quiz Generator</h2>
            <p className="text-muted-foreground">Auto-generate quizzes from any course topic</p>
          </div>
          <Badge className="ml-auto bg-pink-500/10 text-pink-500">5 Credits</Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course Topic</label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., JavaScript Promises and Async/Await" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Questions</label>
                <select value={numQuestions} onChange={e => setNumQuestions(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <Button onClick={generateQuiz} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Brain className="w-4 h-4 mr-2" />Generate Quiz (5 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {quiz && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Quiz</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-4">
                {typeof quiz === 'string' ? quiz : JSON.stringify(quiz, null, 2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
