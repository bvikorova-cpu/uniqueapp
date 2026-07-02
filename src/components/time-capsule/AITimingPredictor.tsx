import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Brain, Calendar, Sparkles, Loader2, Target, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const AITimingPredictor = ({ onBack }: { onBack: () => void }) => {
  const [message, setMessage] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const analyze = () => {
    if (!message.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const keywords = message.toLowerCase();
      let suggestion = { date: "", reason: "", confidence: 0, emotion: "", category: "" };

      if (keywords.includes("birthday") || keywords.includes("born")) {
        suggestion = { date: "2027-06-15", reason: "Aligned with the recipient's next milestone birthday for maximum emotional impact", confidence: 94, emotion: "Joy & Nostalgia", category: "Birthday" };
      } else if (keywords.includes("wedding") || keywords.includes("marriage") || keywords.includes("anniversary")) {
        suggestion = { date: "2028-02-14", reason: "Valentine's Day delivery maximizes romantic significance", confidence: 91, emotion: "Love & Commitment", category: "Anniversary" };
      } else if (keywords.includes("graduation") || keywords.includes("school") || keywords.includes("college")) {
        suggestion = { date: "2028-06-01", reason: "Timed for graduation ceremony season", confidence: 88, emotion: "Pride & Achievement", category: "Education" };
      } else if (keywords.includes("child") || keywords.includes("baby") || keywords.includes("kid")) {
        suggestion = { date: "2036-01-01", reason: "Delivered when the child reaches a significant age for understanding", confidence: 85, emotion: "Family & Legacy", category: "Family" };
      } else {
        suggestion = { date: "2028-01-01", reason: "New Year's Day delivery creates a powerful fresh-start context", confidence: 82, emotion: "Hope & Reflection", category: "Personal Growth" };
      }
      setPrediction(suggestion);
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <>
      <FloatingHowItWorks
        title='AITiming Predictor'
        steps={[
          { title: 'Open the tool', desc: 'Launch the AITiming Predictor panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        AI Timing Predictor
      </h2>
      <p className="text-sm text-muted-foreground">Our AI analyzes your message content and suggests the perfect delivery moment for maximum emotional impact.</p>

      <Card className="border-primary/20">
        <CardContent className="p-5 space-y-4">
          <Textarea placeholder="Paste your time capsule message here and our AI will suggest the perfect delivery date..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
          <Button onClick={analyze} disabled={analyzing || !message.trim()} className="w-full">
            {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Emotional Context...</> : <><Brain className="mr-2 h-4 w-4" /> Analyze & Predict Best Timing</>}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card/80 border border-border/40 text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Suggested Date</p>
                  <p className="font-bold text-sm">{new Date(prediction.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/80 border border-border/40 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-bold text-sm">{prediction.confidence}%</p>
                </div>
                <div className="p-3 rounded-lg bg-card/80 border border-border/40 text-center">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                  <p className="text-xs text-muted-foreground">Emotion</p>
                  <p className="font-bold text-sm">{prediction.emotion}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/80 border border-border/40 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-bold text-sm">{prediction.category}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{prediction.reason}</p>
              <Button className="w-full" variant="outline" onClick={() => {
                navigator.clipboard.writeText(prediction.date).catch(() => {});
                toast.success(`Date ${prediction.date} copied. Paste it when creating your capsule.`);
              }}>Use This Date for My Capsule</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
