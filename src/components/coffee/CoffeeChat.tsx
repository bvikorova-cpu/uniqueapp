import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Send, Coffee, Loader2 } from 'lucide-react';
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

const PAGE_SIZE = 50;

export const CoffeeChat = ({ matchId, open, onOpenChange }: CoffeeChatProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Reset state when match changes / dialog opens
  useEffect(() => {
    if (open && matchId) {
      setHasMore(true);
      initialScrollDone.current = false;
    }
  }, [matchId, open]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['coffee-messages', matchId],
    queryFn: async (): Promise<Message[]> => {
      if (!matchId) return [];
      // Fetch last PAGE_SIZE messages (descending), then reverse to ascending
      const { data, error } = await supabase
        .from('coffee_match_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (error) throw error;
      const list = ((data ?? []) as Message[]).slice().reverse();
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
      return list;
    },
    enabled: !!matchId && open,
  });

  // Dedup helper: merge a message into cache by id (idempotent)
  const upsertMessage = (msg: Message) => {
    queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      const next = [...prev, msg];
      next.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return next;
    });
  };

  const loadOlder = async () => {
    if (!matchId || loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const oldest = messages[0];
    const scrollEl = scrollRef.current;
    const prevHeight = scrollEl?.scrollHeight ?? 0;
    const prevTop = scrollEl?.scrollTop ?? 0;

    const { data, error } = await supabase
      .from('coffee_match_messages')
      .select('*')
      .eq('match_id', matchId)
      .lt('created_at', oldest.created_at)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    setLoadingMore(false);
    if (error) {
      toast({ title: 'Failed to load older messages', description: error.message, variant: 'destructive' });
      return;
    }
    const older = ((data ?? []) as Message[]).slice().reverse();
    setHasMore((data?.length ?? 0) === PAGE_SIZE);

    queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) => {
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...older.filter((m) => !seen.has(m.id)), ...prev];
      merged.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return merged;
    });

    // Preserve scroll position after prepending
    requestAnimationFrame(() => {
      if (scrollEl) {
        scrollEl.scrollTop = prevTop + (scrollEl.scrollHeight - prevHeight);
      }
    });
  };

  // Realtime subscription
  useEffect(() => {
    if (!matchId || !open) return;
    const channel = supabase
      .channel(`coffee-chat:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'coffee_match_messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          upsertMessage(payload.new as Message);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, open]);

  // Auto-scroll: jump to bottom on initial load, smooth on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    if (!initialScrollDone.current) {
      el.scrollTop = el.scrollHeight;
      initialScrollDone.current = true;
    } else {
      // Only auto-scroll if user is near the bottom
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (nearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !matchId || !userId) return;
    setSending(true);
    const { data, error } = await supabase
      .from('coffee_match_messages')
      .insert({ match_id: matchId, sender_id: userId, message: text })
      .select()
      .single();
    setSending(false);
    if (error) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
      return;
    }
    setInput('');
    if (data) upsertMessage(data as Message);
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

        <div ref={scrollRef} className="flex-1 px-4 overflow-y-auto">
          <div className="py-4 space-y-3">
            {hasMore && messages.length > 0 && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadOlder}
                  disabled={loadingMore}
                  className="text-xs text-muted-foreground"
                >
                  {loadingMore ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...</>
                  ) : (
                    'Load older messages'
                  )}
                </Button>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
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
