import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Loader2, Plus, X, Users, MessageCircle } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ThreadAnalysis = () => {
  const [messages, setMessages] = useState<string[]>([""]);
  const [result, setResult] = useState<any>(null);
  const { analyzeThread, isAnalyzingThread } = useLieDetectorCredits();

  const addMessage = () => {
    if (messages.length < 50) setMessages([...messages, ""]);
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
      onSuccess: (data) => setResult(data.analysis),
    });
  };

  return (
    <>
      <FloatingHowItWorks title={"Thread Analysis - How it works"} steps={[{ title: 'Open', desc: 'Access the Thread Analysis section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Thread Analysis.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-5 w-5 text-primary" />
                Conversation Thread Analysis
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{messages.length}/50</Badge>
                <Badge variant="secondary" className="text-xs">15 credits</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-2 items-start"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0 mt-1">
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <Textarea
                    placeholder={`Message ${index + 1}...`}
                    value={message}
                    onChange={(e) => updateMessage(index, e.target.value)}
                    className="min-h-20 text-sm bg-background/50"
                  />
                  {messages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMessage(index)}
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={addMessage}
                variant="outline"
                disabled={messages.length >= 50}
                className="gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add Message
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={messages.filter(m => m.trim()).length === 0 || isAnalyzingThread}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                size="lg"
              >
                {isAnalyzingThread ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Thread...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Analyze Thread
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
