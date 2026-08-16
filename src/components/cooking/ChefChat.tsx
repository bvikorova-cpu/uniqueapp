import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { AiMarkdown } from '@/components/common/AiMarkdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChefChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { data: credits } = useCookingCredits();
  const queryClient = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const history = messages
        .slice(-6)
        .map((m) => `${m.role === 'assistant' ? 'Chef' : 'Guest'}: ${m.content}`)
        .join('\n');
      const { data, error } = await supabase.functions.invoke('generate-gift-message', {
        body: {
          type: 'chef_chat',
          prompt: `${history ? `Conversation so far:\n${history}\n\n` : ''}Guest: ${message}`,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as any;
    },
    onSuccess: (data) => {
      const reply = data.message || data.text || data.result || '';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      queryClient.invalidateQueries({ queryKey: ['cooking-credits'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error communicating with chef');
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  return (
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
                      ? 'bg-primary text-primary-foreground ml-auto max-w-[85%]'
                      : 'bg-muted max-w-[95%]'
                  }`}
                >
                  {msg.role === 'user' ? msg.content : <AiMarkdown content={msg.content} />}
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <p className="text-sm text-muted-foreground">Chef is thinking...</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about a recipe..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={chatMutation.isPending || !credits || credits.credits < 3}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending || !credits || credits.credits < 3}
              size="icon"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">3 credits per message</p>
        </div>
      </Card>
    </div>
  );
};
