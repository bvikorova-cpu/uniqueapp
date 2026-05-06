import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CoffeeChatProps {
  matchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const CoffeeChat = ({ matchId, open, onOpenChange }: CoffeeChatProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['coffee-messages', matchId],
    queryFn: async (): Promise<Message[]> => {
      if (!matchId) return [];
      const { data, error } = await supabase
        .from('coffee_match_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!matchId && open,
  });

  // Realtime subscription
  useEffect(() => {
    if (!matchId || !open) return;
    const channel = supabase
      .channel(`coffee-chat:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'coffee_match_messages', filter: `match_id=eq.${matchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['coffee-messages', matchId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, open, queryClient]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !matchId || !userId) return;
    setSending(true);
    const { error } = await supabase
      .from('coffee_match_messages')
      .insert({ match_id: matchId, sender_id: userId, message: text });
    setSending(false);
    if (error) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
      return;
    }
    setInput('');
    queryClient.invalidateQueries({ queryKey: ['coffee-messages', matchId] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 h-[600px] flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-400" />
            Coffee Buddy Chat
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4" ref={scrollRef as any}>
          <div className="py-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Say hi to your coffee buddy ☕
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === userId;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        mine
                          ? 'bg-amber-500/90 text-white rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      <div>{m.message}</div>
                      <div className={`text-[10px] mt-1 opacity-70`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending || !userId}
          />
          <Button onClick={handleSend} disabled={sending || !input.trim() || !userId} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
