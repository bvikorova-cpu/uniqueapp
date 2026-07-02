import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Baby, Send, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Message {
  id: string;
  message: string;
  role: string;
  created_at: string;
}

export const DigitalOffspringChat = () => {
  const { toast } = useToast();
  const [offspring, setOffspring] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOffspring();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadOffspring = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: offspringData } = await supabase
        .from("digital_offspring")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (offspringData) {
        setOffspring(offspringData);
        loadMessages(offspringData.id);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (offspringId: string) => {
    const { data } = await supabase
      .from("digital_offspring_conversations")
      .select("*")
      .eq("offspring_id", offspringId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const createOffspring = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your digital offspring",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get most recent DNA analysis
      const { data: dnaData } = await supabase
        .from("dna_analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!dnaData) {
        toast({
          title: "DNA Analysis Required",
          description: "Please complete a DNA analysis first",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-digital-offspring', {
        body: { name, dnaAnalysisId: dnaData.id }
      });

      if (error) throw error;

      setOffspring(data.offspring);
      loadMessages(data.offspring.id);
      toast({
        title: "Success!",
        description: `${name} has been created!`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create digital offspring",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !offspring) return;

    try {
      setSending(true);
      const { data, error } = await supabase.functions.invoke('chat-with-offspring', {
        body: { offspringId: offspring.id, message: newMessage }
      });

      if (error) throw error;

      // Reload messages
      loadMessages(offspring.id);
      setNewMessage("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!offspring) {
    return (
      <>
        <FloatingHowItWorks
          title='Digital Offspring Chat'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Digital Offspring Chat panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            Create Your Digital Offspring
          </CardTitle>
          <CardDescription>
            An AI clone with your genetic traits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter name for your digital offspring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createOffspring()}
          />
          <Button onClick={createOffspring} disabled={creating} className="w-full">
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Digital Offspring
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          {offspring.name}
        </CardTitle>
        <CardDescription>
          Your AI offspring with inherited genetic traits
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={sending} size="icon">
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
