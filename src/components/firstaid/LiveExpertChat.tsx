import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Send, Loader2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Message {
  role: "user" | "expert";
  content: string;
  timestamp: Date;
}

const EXPERT_TOPICS = [
  "CPR & Resuscitation", "Wound Care", "Burns Treatment", "Fracture Management",
  "Allergic Reactions", "Poisoning", "Child First Aid", "Mental Health First Aid",
];

export const LiveExpertChat = ({ onBack }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async (topic: string) => {
    const ok = await spendCredit("custom_generation", "Live Expert Chat");
    if (!ok) { toast({ title: "Insufficient Credits", description: "You need 3 credits per session.", variant: "destructive" }); return; }
    
    setSelectedTopic(topic);
    setStarted(true);
    setMessages([{
      role: "expert",
      content: `Hello! I'm Dr. AI, your certified first aid expert. You've selected the topic "${topic}". I'm here to answer your questions with detailed, medically-accurate guidance. How can I help you today?\n\n⚠️ Note: This is AI-powered guidance. In real emergencies, always call 112 first.`,
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => `${m.role === "user" ? "Patient" : "Doctor"}: ${m.content}`).join("\n");
      
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          recipientName: selectedTopic,
          senderName: "expert_chat",
          message: `You are Dr. AI, a certified emergency medicine specialist and first aid expert. You provide detailed, accurate, and compassionate medical guidance. Topic: ${selectedTopic}.

Chat history:
${history}

Patient's new question: ${userMsg}

Provide a thorough, professional response. Use bullet points for clarity. Include relevant safety warnings. Reference evidence-based guidelines when applicable. Always remind about calling emergency services if the situation is life-threatening.`,
        },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "expert", content: data?.message || data?.analysis || "I apologize, let me try again.", timestamp: new Date() }]);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Live Expert Chat - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Expert Chat section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Expert Chat.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Badge className="bg-red-100 text-red-700">3 Credits / Session</Badge>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">AI Expert Chat</h2>
        <p className="text-muted-foreground">Chat with an AI first aid specialist</p>
      </div>

      {!started ? (
        <div className="space-y-3">
          <Card className="border-teal-200 bg-teal-50/50 dark:bg-teal-950/20">
            <CardContent className="py-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-teal-600" />
              <div>
                <p className="font-semibold text-sm">AI-Powered Expert Guidance</p>
                <p className="text-xs text-muted-foreground">Get detailed, evidence-based first aid advice from our AI specialist trained on emergency medicine protocols.</p>
              </div>
            </CardContent>
          </Card>
          <p className="font-semibold text-sm">Select a topic to begin:</p>
          <div className="grid grid-cols-2 gap-2">
            {EXPERT_TOPICS.map(topic => (
              <Button key={topic} variant="outline" className="h-auto py-3 text-sm hover:border-teal-400" onClick={() => startChat(topic)}>{topic}</Button>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-teal-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Dr. AI — {selectedTopic}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto space-y-3 mb-4 pr-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] opacity-60 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3"><Loader2 className="w-4 h-4 animate-spin" /></div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
            <div className="flex gap-2">
              <Input placeholder="Ask your question..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};
