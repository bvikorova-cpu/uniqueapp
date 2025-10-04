import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, Search, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  updated_at: string;
  participants: {
    user_id: string;
    profiles: Profile;
  }[];
  messages: {
    content: string;
    created_at: string;
    sender_id: string;
  }[];
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}

const Messenger = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAllUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);

      const channel = supabase
        .channel(`messages-${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation}`
          },
          (payload) => {
            fetchMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .neq("id", user?.id);

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    setAllUsers(data || []);
  };

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations!inner (
          id,
          updated_at,
          conversation_participants!inner (
            user_id,
            profiles!inner (id, full_name, avatar_url)
          ),
          messages (content, created_at, sender_id)
        )
      `)
      .eq("user_id", user?.id)
      .order("updated_at", { ascending: false, foreignTable: "conversations" });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    const formattedConversations = data?.map((item: any) => ({
      id: item.conversations.id,
      updated_at: item.conversations.updated_at,
      participants: item.conversations.conversation_participants,
      messages: item.conversations.messages || []
    })) || [];

    setConversations(formattedConversations);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        profiles!messages_sender_id_fkey (id, full_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const createConversation = async (otherUserId: string) => {
    const { data: existingConversation } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user?.id);

    if (existingConversation) {
      for (const conv of existingConversation) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", otherUserId)
          .single();

        if (otherParticipant) {
          setSelectedConversation(conv.conversation_id);
          return;
        }
      }
    }

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (convError || !conversation) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vytvoriť konverzáciu",
        variant: "destructive",
      });
      return;
    }

    const { error: partError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: user?.id },
        { conversation_id: conversation.id, user_id: otherUserId }
      ]);

    if (partError) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať účastníkov",
        variant: "destructive",
      });
      return;
    }

    await fetchConversations();
    setSelectedConversation(conversation.id);
    setSelectedUserId("");
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation,
        sender_id: user?.id,
        content: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odoslať správu",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
    await fetchConversations();
  };

  const getOtherUser = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== user?.id
    );
    return otherParticipant?.profiles;
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return "Žiadne správy";
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    return lastMsg.content.length > 50 
      ? lastMsg.content.substring(0, 50) + "..." 
      : lastMsg.content;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConvData = conversations.find(c => c.id === selectedConversation);
  const otherUserInConv = selectedConvData ? getOtherUser(selectedConvData) : null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversations List */}
          <Card className="md:col-span-1 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Správy
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nová konverzácia</DialogTitle>
                    </DialogHeader>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte používateľa" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || "Bez mena"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => selectedUserId && createConversation(selectedUserId)}
                      disabled={!selectedUserId}
                    >
                      Vytvoriť konverzáciu
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hľadať konverzácie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-4">
                  {filteredConversations.map(conversation => {
                    const otherUser = getOtherUser(conversation);
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={otherUser?.avatar_url || undefined} />
                          <AvatarFallback>
                            {otherUser?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">
                            {otherUser?.full_name || "Neznámy používateľ"}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {getLastMessage(conversation)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 h-full flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={otherUserInConv?.avatar_url || undefined} />
                      <AvatarFallback>
                        {otherUserInConv?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle>
                      {otherUserInConv?.full_name || "Neznámy používateľ"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.map(message => {
                        const isOwn = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.profiles?.avatar_url || undefined} />
                              <AvatarFallback>
                                {message.profiles?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(message.created_at).toLocaleTimeString("sk-SK", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      placeholder="Napíšte správu..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Vyberte konverzáciu alebo vytvorte novú</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messenger;
