import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChefChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { data: credits } = useCookingCredits();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke('chat-with-chef', {
        body: { message, session_id: sessionId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setSessionId(data.session_id);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error communicating with chef');
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  return (
    <>
      <FloatingHowItWorks title="How Chef Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Chat with AI Chef
        </h2>
        
        <div className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center">Start a conversation with the AI chef...</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                      : 'bg-muted max-w-[80%]'
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about a recipe..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={chatMutation.isPending || !credits || credits.credits < 1}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending || !credits || credits.credits < 1}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">1 credit per message</p>
        </div>
      </Card>
    </div>
    </>
    );
};
