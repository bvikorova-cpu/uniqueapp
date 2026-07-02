import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Loader2, CheckCircle, XCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const CERT_TRACKS = [
  { id: "basic", label: "Basic First Aid", questions: 10, icon: "🩹", desc: "Fundamentals of emergency response", color: "from-green-500 to-emerald-600" },
  { id: "cpr", label: "CPR & AED", questions: 10, icon: "💓", desc: "Cardiopulmonary resuscitation mastery", color: "from-red-500 to-rose-600" },
  { id: "trauma", label: "Trauma Response", questions: 10, icon: "🩸", desc: "Bleeding, fractures & shock management", color: "from-orange-500 to-amber-600" },
  { id: "pediatric", label: "Pediatric First Aid", questions: 10, icon: "👶", desc: "Child & infant emergency care", color: "from-blue-500 to-indigo-600" },
  { id: "wilderness", label: "Wilderness First Aid", questions: 10, icon: "🏔️", desc: "Remote & outdoor emergencies", color: "from-emerald-600 to-teal-600" },
  { id: "advanced", label: "Advanced Life Support", questions: 15, icon: "🏥", desc: "Comprehensive certification exam", color: "from-purple-500 to-violet-600" },
];

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const AICertificationSystem = ({ onBack }: Props) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certified, setCertified] = useState(false);
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  const startExam = async (trackId: string) => {
    const ok = await spendCredit("custom_generation", "First Aid Certification Exam");
    if (!ok) { toast({ title: "Insufficient Credits", description: "You need 3 credits.", variant: "destructive" }); return; }

    setSelectedTrack(trackId);
    setCurrentQ(0);
    setAnswers([]);
    setShowResult(false);
    setCertified(false);
    setLoading(true);

    try {
      const track = CERT_TRACKS.find(t => t.id === trackId);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          recipientName: track?.label || trackId,
          senderName: "exam",
          message: `Generate a ${track?.questions || 10}-question multiple choice certification exam for "${track?.label}". Topic: ${track?.desc}.

Each question should test practical first aid knowledge. Format EXACTLY as JSON array:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]

Where "correct" is the 0-based index of the right answer. Make questions challenging but fair. Include real medical scenarios.`,
        },
      });
      if (error) throw error;
      const text = data?.message || data?.analysis || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setQuestions(parsed.slice(0, track?.questions || 10));
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate exam", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    
    if (currentQ + 1 >= questions.length) {
      const score = newAnswers.reduce((acc, ans, i) => acc + (ans === questions[i].correct ? 1 : 0), 0);
      const passed = (score / questions.length) >= 0.8;
      setCertified(passed);
      setShowResult(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const score = answers.reduce((acc, ans, i) => acc + (ans === questions[i]?.correct ? 1 : 0), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const downloadCertificate = () => {
    const track = CERT_TRACKS.find(t => t.id === selectedTrack);
    const certText = `
═══════════════════════════════════════
       FIRST AID CERTIFICATION
═══════════════════════════════════════

This certifies that the holder has
successfully completed the

    ${track?.label?.toUpperCase()} CERTIFICATION

Score: ${percentage}% (${score}/${questions.length})
Date: ${new Date().toLocaleDateString()}

This digital certificate validates
completion of the AI-powered first
aid training program.

═══════════════════════════════════════
    `;
    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FirstAid_Certificate_${track?.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Certificate Downloaded!", description: "Your digital certificate has been saved." });
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Certification System - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Certification System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Certification System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Badge className="bg-red-100 text-red-700">3 Credits</Badge>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Certification System</h2>
        <p className="text-muted-foreground">Earn digital certificates by passing AI-generated exams</p>
      </div>

      {!selectedTrack && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CERT_TRACKS.map(track => (
            <Card key={track.id} className="cursor-pointer hover:scale-[1.02] transition-all hover:border-amber-300" onClick={() => startExam(track.id)}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{track.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{track.label}</p>
                    <p className="text-xs text-muted-foreground">{track.desc}</p>
                  </div>
                  <Badge variant="outline">{track.questions} Q</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <Card><CardContent className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" /><p>Generating certification exam...</p></CardContent></Card>
      )}

      {questions.length > 0 && !showResult && !loading && (
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Question {currentQ + 1} of {questions.length}</CardTitle>
              <Badge variant="outline">{Math.round(((currentQ) / questions.length) * 100)}% complete</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{questions[currentQ]?.question}</p>
            <div className="space-y-2">
              {questions[currentQ]?.options.map((opt, i) => (
                <Button key={i} variant="outline" className="w-full justify-start text-left h-auto py-3 hover:border-amber-400" onClick={() => answerQuestion(i)}>
                  <span className="font-bold mr-3 text-amber-600">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-sm">{opt}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showResult && (
        <div className="space-y-4">
          <Card className={certified ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30" : "border-red-300 bg-red-50/50 dark:bg-red-950/30"}>
            <CardContent className="py-8 text-center">
              {certified ? <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" /> : <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />}
              <h3 className="text-2xl font-bold mb-1">{certified ? "🎉 Certified!" : "Not Passed"}</h3>
              <p className="text-3xl font-black mb-2">{percentage}%</p>
              <p className="text-muted-foreground">{score}/{questions.length} correct answers (80% required to pass)</p>
              {certified && (
                <Button className="mt-4" onClick={downloadCertificate}><Download className="mr-2 h-4 w-4" /> Download Certificate</Button>
              )}
            </CardContent>
          </Card>

          <h3 className="font-bold text-lg">Answer Review</h3>
          {questions.map((q, i) => (
            <Card key={i} className={answers[i] === q.correct ? "border-emerald-200" : "border-red-200"}>
              <CardContent className="py-3">
                <div className="flex items-start gap-2">
                  {answers[i] === q.correct ? <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                  <div>
                    <p className="font-medium text-sm">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">Your answer: {q.options[answers[i]]} {answers[i] !== q.correct && `| Correct: ${q.options[q.correct]}`}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{q.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full" onClick={() => { setSelectedTrack(null); setQuestions([]); setShowResult(false); }}>
            Try Another Certification
          </Button>
        </div>
      )}
    </div>
    </>
  );
};
