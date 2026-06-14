import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, ArrowLeft, MessageCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VideoCall from "@/components/messenger/VideoCall";
import { ReviewDialog } from "./ReviewDialog";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  offering_id?: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  offering_id?: string;
  last_message_at: string;
  status: string;
  other_user_id?: string;
  offering_title?: string;
}

export const SkillSwapMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getCurrentUser(); }, []);
  useEffect(() => { if (currentUserId) loadConversations(); }, [currentUserId]);
  useEffect(() => { if (selectedConversation && currentUserId) { loadMessages(); markMessagesAsRead(); } }, [selectedConversation, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase.channel('skill-swap-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'skill_swap_messages', filter: `receiver_id=eq.${currentUserId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedConversation) { setMessages(prev => [...prev, newMsg]); scrollToBottom(); }
          loadConversations();
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedConversation]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setCurrentUserId(session.user.id);
  };

  const loadConversations = async () => {
    if (!currentUserId) return;
    try {
      const { data, error } = await supabase.from('skill_swap_conversations')
        .select('*, skill_offerings(title)')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(conv => ({
        ...conv,
        other_user_id: conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id,
        offering_title: conv.skill_offerings?.title,
      })) as Conversation[];
      setConversations(mapped);

      const otherIds = Array.from(new Set(mapped.map(c => c.other_user_id).filter(Boolean) as string[]));
      const missing = otherIds.filter(id => !userNames[id]);
      if (missing.length > 0) {
        const { data: profs } = await (supabase as any)
          .from('profiles_public').select('id, full_name').in('id', missing);
        if (profs?.length) {
          setUserNames(prev => {
            const next = { ...prev };
            for (const p of profs as any[]) next[p.id] = p.full_name || 'User';
            return next;
          });
        }
      }
    } catch (error) { console.error('Error loading conversations:', error); }
    finally { setLoading(false); }
  };

  const loadMessages = async () => {
    if (!selectedConversation || !currentUserId) return;
    const conv = conversations.find(c => c.id === selectedConversation);
    if (!conv) return;
    try {
      const { data, error } = await supabase.from('skill_swap_messages').select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${conv.other_user_id}),and(sender_id.eq.${conv.other_user_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) { console.error('Error loading messages:', error); }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !currentUserId) return;
    const conv = conversations.find(c => c.id === selectedConversation);
    if (!conv) return;
    try { await supabase.from('skill_swap_messages').update({ is_read: true }).eq('receiver_id', currentUserId).eq('sender_id', conv.other_user_id); }
    catch (error) { console.error('Error marking messages as read:', error); }
  };

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedConversation || !currentUserId || sending) return;
    if (trimmed.length > 2000) { toast.error("Message too long (max 2000 chars)"); return; }
    const conv = conversations.find(c => c.id === selectedConversation);
    if (!conv?.other_user_id) return;
    setSending(true);
    try {
      const { error } = await supabase.from('skill_swap_messages').insert([{
        sender_id: currentUserId, receiver_id: conv.other_user_id, message: trimmed, offering_id: conv.offering_id,
      }]);
      if (error) throw error;
      await supabase.from('skill_swap_conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedConversation);
      setNewMessage(""); loadMessages(); loadConversations();
    } catch (error) { console.error('Error sending message:', error); toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const handleCompleteExchange = async () => {
    if (!selectedConversation) return;
    try {
      const { error } = await supabase.from('skill_swap_conversations').update({ status: 'completed' }).eq('id', selectedConversation);
      if (error) throw error;
      toast.success("Exchange marked as complete!"); loadConversations(); setShowReviewDialog(true);
    } catch (error) { console.error('Error completing exchange:', error); toast.error("Failed to complete exchange"); }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Messages
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversations List */}
        <Card className={`p-4 bg-card/80 backdrop-blur-xl border-border/50 ${selectedConversation ? 'hidden md:block' : ''}`}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" /> Conversations
          </h3>
          <ScrollArea className="h-[520px]">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No conversations yet. Start by requesting an exchange!</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const name = (conv.other_user_id && userNames[conv.other_user_id]) || 'User';
                  return (
                  <Card key={conv.id}
                    className={`p-3 cursor-pointer transition-all border-border/30 hover:border-primary/30 ${
                      selectedConversation === conv.id ? 'bg-primary/10 border-primary/30' : 'bg-muted/10 hover:bg-muted/20'
                    }`}
                    onClick={() => setSelectedConversation(conv.id)}>
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{name}</p>
                        {conv.offering_title && <p className="text-[10px] text-muted-foreground truncate">{conv.offering_title}</p>}
                        <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Messages Area */}
        <Card className={`md:col-span-2 flex flex-col bg-card/80 backdrop-blur-xl border-border/50 ${!selectedConversation ? 'hidden md:flex' : ''}`}>
          {selectedConversation ? (() => {
            const activeConv = conversations.find(c => c.id === selectedConversation);
            const otherId = activeConv?.other_user_id || "";
            const otherName = (otherId && userNames[otherId]) || 'User';
            return (
            <>
              <div className="p-4 border-b border-border/30 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{otherName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-sm">{otherName}</p>
                  {activeConv?.offering_title && (
                    <p className="text-[10px] text-muted-foreground">{activeConv.offering_title}</p>
                  )}
                  {activeConv?.status === 'completed' && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-500"><CheckCircle className="w-3 h-3" /><span>Completed</span></div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeConv?.status === 'active' && (
                    <Button onClick={handleCompleteExchange} size="sm" variant="outline" className="text-xs h-7">Mark Complete</Button>
                  )}
                  {currentUserId && (
                    <VideoCall
                      conversationId={selectedConversation} userId={currentUserId}
                      otherUserId={otherId}
                      otherUserName={otherName}
                    />
                  )}
                </div>
              </div>

              {showReviewDialog && (
                <ReviewDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}
                  conversationId={selectedConversation}
                  reviewedUserId={otherId}
                  reviewedUserName={otherName} onReviewSubmitted={() => { toast.success("Thank you for your review!"); loadConversations(); }}
                />
              )}

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl p-3 ${
                        msg.sender_id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted/30 border border-border/30'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className="text-[10px] opacity-70 mt-1">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/30">
                <div className="flex gap-2">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." maxLength={2000}
                    disabled={sending}
                    onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()} className="bg-muted/10 border-border/50" />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon" className="flex-shrink-0"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
            );
          })() : (
            <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
