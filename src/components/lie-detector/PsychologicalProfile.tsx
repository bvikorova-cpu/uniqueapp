import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Loader2, Plus, X, Brain } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";

export const PsychologicalProfile = () => {
  const [messages, setMessages] = useState<string[]>([""]);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<any>(null);
  const { analyzeProfile, isAnalyzingProfile } = useLieDetectorCredits();

  const addMessage = () => {
    setMessages([...messages, ""]);
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
    analyzeProfile({ messages: formatted, context }, {
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
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            Deep Psychological Profile (50 credits)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
              Context (Optional)
            </label>
            <Input
              placeholder="Relationship type, situation, etc..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
              Messages from Person
            </label>
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
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={addMessage}
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Message
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={messages.filter(m => m.trim()).length === 0 || isAnalyzingProfile}
              className="w-full sm:w-auto text-sm sm:text-base"
              size="lg"
            >
              {isAnalyzingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Create Profile (50 credits)
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