import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Loader2, Plus, X, Users } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";

export const ThreadAnalysis = () => {
  const [messages, setMessages] = useState<string[]>([""]);
  const [result, setResult] = useState<any>(null);
  const { analyzeThread, isAnalyzingThread } = useLieDetectorCredits();

  const addMessage = () => {
    if (messages.length < 50) {
      setMessages([...messages, ""]);
    }
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const updateMessage = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  const handleAnalyze = () => {
    const validMessages = messages.filter(m => m.trim());
    if (validMessages.length === 0) return;
    
    const formatted = validMessages.map(text => ({ text }));
    analyzeThread(formatted, {
      onSuccess: (data) => {
        setResult(data.analysis);
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="glassmorphism">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Analyze Conversation Thread (15 credits)
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {messages.length}/50 messages
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder={`Message ${index + 1}...`}
                  value={message}
                  onChange={(e) => updateMessage(index, e.target.value)}
                  className="min-h-20 sm:min-h-24 text-sm sm:text-base"
                />
                {messages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMessage(index)}
                    className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={addMessage}
              variant="outline"
              disabled={messages.length >= 50}
              className="w-full sm:w-auto text-sm sm:text-base"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Message ({messages.length}/50)
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={messages.filter(m => m.trim()).length === 0 || isAnalyzingThread}
              className="w-full sm:w-auto text-sm sm:text-base"
              size="lg"
            >
              {isAnalyzingThread ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Analyze Thread (15 credits)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && <AnalysisResults analysis={result} />}
    </div>
  );
};