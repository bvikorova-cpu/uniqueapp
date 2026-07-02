import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Loader2, Send, MessageSquare, Lightbulb } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const EXAMPLE_PROMPTS = [
  "I was at work the whole time, you can ask anyone.",
  "I never said that, you're imagining things.",
  "Trust me, I would never lie to you about something like this.",
];

export const SingleMessageAnalysis = () => {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const { analyzeMessage, isAnalyzingMessage } = useLieDetectorCredits();

  const handleAnalyze = () => {
    if (!message.trim()) return;
    analyzeMessage(message, {
      onSuccess: (data) => setResult(data.analysis),
    });
  };

  return (
    <>
      <FloatingHowItWorks title={"Single Message Analysis - How it works"} steps={[{ title: 'Open', desc: 'Access the Single Message Analysis section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Single Message Analysis.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Single Message Analysis
              </div>
              <Badge variant="secondary" className="text-xs">3 credits</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Example prompts */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" />
                Try an example:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(prompt)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-muted/20 border border-border/30 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
                  >
                    "{prompt.substring(0, 35)}..."
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Paste the message you want to analyze for truthfulness..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32 sm:min-h-40 text-sm sm:text-base bg-background/50"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {message.length} characters
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={!message.trim() || isAnalyzingMessage}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white"
                size="lg"
              >
                {isAnalyzingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Analyze Message
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {result && <AnalysisResults analysis={result} />}
    </div>
    </>
  );
};
