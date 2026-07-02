import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Send, Coffee, Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CoffeeChatProps {
  matchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SendStatus = 'pending' | 'sent' | 'failed';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  status?: SendStatus;
  tempId?: string;
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
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const loadingMoreRef = useRef(false);

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

  // Dedup helper: merge a server message into cache, replacing any matching temp/pending entry
  const upsertMessage = (msg: Message) => {
    queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) => {
      // Replace optimistic message with same content from same sender if still pending
      const withoutTemp = prev.filter(
        (m) =>
          !(m.status === 'pending' && m.sender_id === msg.sender_id && m.message === msg.message)
      );
      if (withoutTemp.some((m) => m.id === msg.id)) return withoutTemp;
      const next = [...withoutTemp, { ...msg, status: 'sent' as SendStatus }];
      next.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return next;
    });
  };

  const updateMessageStatus = (tempId: string, patch: Partial<Message>) => {
    queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) =>
      prev.map((m) => (m.tempId === tempId ? { ...m, ...patch } : m))
    );
  };

  const removeMessage = (tempId: string) => {
    queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) =>
      prev.filter((m) => m.tempId !== tempId)
    );
  };

  const loadOlder = async () => {
    if (!matchId || loadingMoreRef.current || !hasMore || messages.length === 0) return;
    loadingMoreRef.current = true;
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
      loadingMoreRef.current = false;
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
      loadingMoreRef.current = false;
    });
  };

  // Infinite scroll: observe top sentinel to load older messages automatically
  useEffect(() => {
    if (!open || !matchId || !hasMore) return;
    const root = scrollRef.current;
    const sentinel = topSentinelRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && initialScrollDone.current) {
          loadOlder();
        }
      },
      { root, rootMargin: '100px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, matchId, hasMore, messages.length]);

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

  const sendOptimistic = async (text: string, existingTempId?: string) => {
    if (!matchId || !userId) return;
    const tempId = existingTempId ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (existingTempId) {
      updateMessageStatus(existingTempId, { status: 'pending' });
    } else {
      const optimistic: Message = {
        id: tempId,
        tempId,
        match_id: matchId,
        sender_id: userId,
        message: text,
        created_at: new Date().toISOString(),
        status: 'pending',
      };
      queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) => {
        const next = [...prev, optimistic];
        next.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return next;
      });
    }

    const { data, error } = await supabase
      .from('coffee_match_messages')
      .insert({ match_id: matchId, sender_id: userId, message: text })
      .select()
      .single();

    if (error) {
      updateMessageStatus(tempId, { status: 'failed' });
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
      return;
    }
    if (data) {
      // Replace optimistic with server row
      queryClient.setQueryData<Message[]>(['coffee-messages', matchId], (prev = []) => {
        const filtered = prev.filter((m) => m.tempId !== tempId);
        if (filtered.some((m) => m.id === (data as Message).id)) return filtered;
        const next = [...filtered, { ...(data as Message), status: 'sent' as SendStatus }];
        next.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return next;
      });
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !matchId || !userId) return;
    setInput('');
    setSending(true);
    await sendOptimistic(text);
    setSending(false);
  };

  const retryMessage = async (m: Message) => {
    if (!m.tempId) return;
    await sendOptimistic(m.message, m.tempId);
  };

  const dismissFailed = (m: Message) => {
    if (m.tempId) removeMessage(m.tempId);
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
            <div ref={topSentinelRef} aria-hidden="true" />
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!hasMore && messages.length >= PAGE_SIZE && (
              <p className="text-center text-[10px] text-muted-foreground py-1">Beginning of conversation</p>
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
                const status: SendStatus = m.status ?? 'sent';
                const failed = mine && status === 'failed';
                const pending = mine && status === 'pending';
                return (
                  <div key={m.tempId ?? m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[75%]">
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          mine
                            ? failed
                              ? 'bg-destructive/80 text-destructive-foreground rounded-br-sm'
                              : 'bg-amber-500/90 text-white rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        } ${pending ? 'opacity-70' : ''}`}
                      >
                        <div>{m.message}</div>
                        <div className="text-[10px] mt-1 opacity-70 flex items-center gap-1 justify-end">
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {mine && status === 'pending' && (
                            <Loader2 className="h-3 w-3 animate-spin" aria-label="Sending" />
                          )}
                          {mine && status === 'sent' && (
                            <Check className="h-3 w-3" aria-label="Sent" />
                          )}
                          {mine && status === 'failed' && (
                            <AlertCircle className="h-3 w-3" aria-label="Failed" />
                          )}
                        </div>
                      </div>
                      {failed && (
                        <div className="flex gap-2 mt-1 justify-end">
                          <button
                            type="button"
                            onClick={() => retryMessage(m)}
                            className="text-[10px] text-destructive hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" /> Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => dismissFailed(m)}
                            className="text-[10px] text-muted-foreground hover:underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

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
