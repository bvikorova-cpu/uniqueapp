import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Loader2, Send } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";

export const SingleMessageAnalysis = () => {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const { analyzeMessage, isAnalyzingMessage } = useLieDetectorCredits();

  const handleAnalyze = () => {
    if (!message.trim()) return;
    
    analyzeMessage(message, {
      onSuccess: (data) => {
        setResult(data.analysis);
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            Analyze Single Message (3 credits)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste the message you want to analyze for truthfulness..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32 sm:min-h-40 text-sm sm:text-base"
          />
          <Button
            onClick={handleAnalyze}
            disabled={!message.trim() || isAnalyzingMessage}
            className="w-full sm:w-auto text-sm sm:text-base"
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
                Analyze Message (3 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && <AnalysisResults analysis={result} />}
    </div>
  );
};