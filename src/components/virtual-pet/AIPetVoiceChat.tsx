import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageCircle, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

interface ChatMessage { role: "user" | "assistant"; content: string; }

export const AIPetVoiceChat = ({ onBack }: Props) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { credits, useCredit } = useAICredits();

  const { data: pets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!selectedPetId) return toast.error("Select a pet first");
    if (credits.credits_remaining < 2) return toast.error("Not enough credits (2 required per message)");

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-voice-chat', {
        body: {
          petName: pet?.name,
          species: pet?.pet_types?.species,
          level: pet?.level,
          happiness: pet?.happiness,
          energy: pet?.energy,
          message: input,
          chatHistory: messages.slice(-10)
        }
      });
      if (error) throw error;
      for (let i = 0; i < 2; i++) await useCredit("custom_generation", "AI Pet Voice Chat");
      setMessages(prev => [...prev, { role: "assistant", content: data.result }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-2">
          <MessageCircle className="w-8 h-8 text-cyan-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Pet Voice Chat</h2>
        <p className="text-muted-foreground text-sm">Have a conversation with your pet's AI personality</p>
        <p className="text-xs text-primary font-semibold">2 Credits per message</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <Select value={selectedPetId} onValueChange={v => { setSelectedPetId(v); setMessages([]); }}>
            <SelectTrigger><SelectValue placeholder="Select your pet to chat with..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Lv.{p.level} {p.pet_types?.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPetId && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
          <CardContent className="p-4 space-y-3">
            <div className="h-[300px] overflow-y-auto space-y-3 pr-2">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-12">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/40" />
                  <p>Say hi to your pet! They'll respond with their unique personality.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message to your pet..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
