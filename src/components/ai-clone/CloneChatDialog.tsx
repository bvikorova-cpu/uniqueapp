import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Loader2, User } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CloneChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clone: {
    id: string;
    clone_name: string;
    personality_data: any;
  } | null;
}

const generateLocalResponse = (cloneName: string, personality: string, message: string): string => {
  const greetings = ["hey", "hi", "hello", "hola"];
  const isGreeting = greetings.some(g => message.toLowerCase().startsWith(g));
  
  if (isGreeting) {
    return `Hey there! I'm ${cloneName}. Great to chat with you! What's on your mind?`;
  }
  
  const responses = [
    `That's a really interesting thought! As ${cloneName}, I'd say it depends on perspective. Tell me more about what you think?`,
    `I love that question! Here's my take: life is all about exploring new ideas and connecting with others. What drives your curiosity about this?`,
    `Hmm, let me think about that... I believe the key is to stay open-minded and keep learning. What's your experience been?`,
    `Great point! I think there's always more than meets the eye. As ${cloneName}, I'd encourage you to dig deeper into that.`,
    `That resonates with me! Communication is everything, and I appreciate you sharing that. Want to explore this further?`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export function CloneChatDialog({ open, onOpenChange, clone }: CloneChatDialogProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && clone) {
      loadChatHistory();
    }
  }, [open, clone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!clone) return;
    try {
      const { data, error } = await supabase
        .from('clone_chat_messages')
        .select('role, content')
        .eq('clone_id', clone.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })));
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !clone || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const personality = clone.personality_data?.personality || clone.clone_name;
      
      // Generate response locally (no edge function needed)
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      const response = generateLocalResponse(clone.clone_name, personality, userMessage);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Save to DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('clone_chat_messages').insert([
          { clone_id: clone.id, user_id: user.id, role: 'user', content: userMessage },
          { clone_id: clone.id, user_id: user.id, role: 'assistant', content: response },
        ]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send message", variant: "destructive" });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat with {clone?.clone_name || "Clone"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation with {clone?.clone_name}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
