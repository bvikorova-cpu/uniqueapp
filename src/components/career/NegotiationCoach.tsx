import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Save } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

interface Message {
  role: string;
  content: string;
}

const NegotiationCoach = () => {
  const { toast } = useToast();
  const { credits, useCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [jobTitle, setJobTitle] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  const [message, setMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  const startSession = async () => {
    if (!jobTitle) {
      toast({ title: "Error", description: "Please enter a job title", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: sessionData, error: sessionError } = await supabase
        .from("negotiation_sessions")
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          current_salary: currentSalary ? parseFloat(currentSalary) : null,
          target_salary: targetSalary ? parseFloat(targetSalary) : null,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(sessionData.id);
      
      toast({ title: "Session Started", description: "Ask your first question" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      await useCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("career-negotiation", {
        body: { 
          jobTitle, 
          currentSalary, 
          targetSalary, 
          message,
          conversationHistory 
        },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) throw response.error;

      const newHistory = [
        ...conversationHistory,
        { role: "user", content: message },
        { role: "assistant", content: response.data.response }
      ];
      
      setConversationHistory(newHistory);
      setMessage("");

      if (sessionId) {
        await supabase
          .from("negotiation_sessions")
          .update({
            conversation_history: newHistory,
            ai_advice: response.data.response,
          })
          .eq("id", sessionId);
      }

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async () => {
    if (!sessionId) {
      await startSession();
    } else {
      toast({ title: "Saved", description: "Session saved successfully" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Negotiation Coach</CardTitle>
        <CardDescription>Get expert advice on negotiating your salary</CardDescription>
        <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Developer"
            />
          </div>
          <div>
            <Label htmlFor="currentSalary">Current Salary</Label>
            <Input
              id="currentSalary"
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
              placeholder="50000"
            />
          </div>
          <div>
            <Label htmlFor="targetSalary">Target Salary</Label>
            <Input
              id="targetSalary"
              type="number"
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              placeholder="70000"
            />
          </div>
        </div>

        {!sessionId && (
          <Button onClick={startSession} className="w-full">
            Start Coaching Session
          </Button>
        )}

        {sessionId && (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-muted rounded-lg">
              {conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground ml-8" 
                      : "bg-background mr-8"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask your question..."
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={sendMessage} disabled={loading} size="icon">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button onClick={saveSession} variant="outline" size="icon">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NegotiationCoach;