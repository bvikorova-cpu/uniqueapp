import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Loader2, Plus, X, Brain, MessageCircle, Info } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PsychologicalProfile = () => {
  const [messages, setMessages] = useState<string[]>([""]);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<any>(null);
  const { analyzeProfile, isAnalyzingProfile } = useLieDetectorCredits();

  const addMessage = () => setMessages([...messages, ""]);

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
      onSuccess: (data) => setResult(data.analysis),
    });
  };

  return (
    <>
      <FloatingHowItWorks title={"Psychological Profile - How it works"} steps={[{ title: 'Open', desc: 'Access the Psychological Profile section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Psychological Profile.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Brain className="h-5 w-5 text-primary" />
                Deep Psychological Profile
              </CardTitle>
              <Badge variant="secondary" className="text-xs">50 credits</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Provide multiple messages from the same person for the most accurate psychological profile. Add context about your relationship for better insights.
              </p>
            </div>

            {/* Context */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                Context (Optional)
              </label>
              <Input
                placeholder="e.g., Partner, Colleague, Online contact, Dating app match..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="text-sm bg-background/50"
              />
            </div>

            {/* Messages */}
            <div>
              <label className="text-xs font-medium mb-2 block text-muted-foreground">
                Messages from Person ({messages.length})
              </label>
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0 mt-1">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
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
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={addMessage} variant="outline" className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add Message
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={messages.filter(m => m.trim()).length === 0 || isAnalyzingProfile}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"
                size="lg"
              >
                {isAnalyzingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Create Profile
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
