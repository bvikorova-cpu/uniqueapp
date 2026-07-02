import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileCheck, Loader2, Copy, Check, Sparkles, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 5;

interface Props { onBack: () => void; }

export function AIHomeworkGraderView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [subject, setSubject] = useState("");
  const [assignment, setAssignment] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [gradingStyle, setGradingStyle] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const gradeHomework = async () => {
    if (!assignment.trim() || !studentAnswer.trim()) {
      toast({ title: "Missing Information", description: "Please enter both the assignment and student answer", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    setScore(null);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'grade-homework', subject, assignment, studentAnswer, gradingStyle }
      });
      if (error) throw error;
      const text = data?.result || "";
      setResult(text);
      const scoreMatch = text.match(/(\d{1,3})(?:\s*\/\s*100|%)/);
      if (scoreMatch) setScore(parseInt(scoreMatch[1]));
    } catch (err: any) {
      toast({ title: "Grading Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const getScoreColor = (s: number) => s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-red-500";
  const getScoreIcon = (s: number) => s >= 80 ? CheckCircle2 : s >= 60 ? AlertTriangle : XCircle;

  return (
    <>
      <FloatingHowItWorks title={"A I Homework Grader View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Homework Grader View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Homework Grader View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-emerald-500" /> AI Homework Grader
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">5 CR</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Auto-grade student submissions with detailed AI feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-500" /> Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Subject</label>
              <Input placeholder="e.g. Mathematics, Physics, Literature..." value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Assignment / Question</label>
              <Textarea placeholder="Enter the assignment prompt or question..." value={assignment} onChange={e => setAssignment(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Student's Answer</label>
              <Textarea placeholder="Paste the student's submitted answer here..." value={studentAnswer} onChange={e => setStudentAnswer(e.target.value)} rows={6} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Grading Style</label>
              <Select value={gradingStyle} onValueChange={setGradingStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed (Full feedback)</SelectItem>
                  <SelectItem value="quick">Quick (Score + summary)</SelectItem>
                  <SelectItem value="encouraging">Encouraging (Growth-focused)</SelectItem>
                  <SelectItem value="strict">Strict (Academic standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={gradeHomework} disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Grading...</> : <><FileCheck className="h-4 w-4 mr-2" /> Grade Submission</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Grading Result</span>
              {result && <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {score !== null && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-2">
                  {(() => { const Icon = getScoreIcon(score); return <Icon className={`h-8 w-8 ${getScoreColor(score)}`} />; })()}
                  <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            )}
            {result ? (
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed max-h-[500px] overflow-y-auto">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <FileCheck className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Submit an assignment to get AI grading</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
