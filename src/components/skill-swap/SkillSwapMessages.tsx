import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedConversation && currentUserId) {
      loadMessages();
      markMessagesAsRead();
    }
  }, [selectedConversation, currentUserId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('skill-swap-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'skill_swap_messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedConversation) {
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
          }
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUserId(session.user.id);
    }
  };

  const loadConversations = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('skill_swap_conversations')
        .select('*, skill_offerings(title)')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = data?.map(conv => ({
        ...conv,
        other_user_id: conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id,
        offering_title: conv.skill_offerings?.title,
      })) || [];

      setConversations(formattedConversations as any);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation || !currentUserId) return;

    const conv = conversations.find(c => c.id === selectedConversation);
    if (!conv) return;

    try {
      const { data, error } = await supabase
        .from('skill_swap_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${conv.other_user_id}),and(sender_id.eq.${conv.other_user_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !currentUserId) return;

    const conv = conversations.find(c => c.id === selectedConversation);
    if (!conv) return;

    try {
      await supabase
        .from('skill_swap_messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', conv.other_user_id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    const conv = conversations.find(c => c.id === selectedConversation);
    if (!conv) return;

    try {
      const { error } = await supabase.from('skill_swap_messages').insert([
        {
          sender_id: currentUserId,
          receiver_id: conv.other_user_id,
          message: newMessage,
          offering_id: conv.offering_id,
        },
      ]);

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('skill_swap_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      setNewMessage("");
      loadMessages();
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className={`p-4 ${selectedConversation ? 'hidden md:block' : ''}`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Conversations
        </h3>
        <ScrollArea className="h-[520px]">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet. Start by requesting an exchange!
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    selectedConversation === conv.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">User</p>
                      {conv.offering_title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.offering_title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Messages Area */}
      <Card className={`md:col-span-2 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">User</p>
                {conversations.find(c => c.id === selectedConversation)?.offering_title && (
                  <p className="text-xs text-muted-foreground">
                    {conversations.find(c => c.id === selectedConversation)?.offering_title}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_id === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};