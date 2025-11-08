import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoCall from "@/components/messenger/VideoCall";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  story_id?: string | null;
}

interface MessageWithProfile extends Message {
  sender_profile: Profile;
}

interface Conversation {
  id: string;
  updated_at: string;
  otherUser: Profile | null;
  lastMessage?: Message;
}

const Messenger = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [profilesCache, setProfilesCache] = useState<Map<string, Profile>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

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
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getProfile = async (userId: string): Promise<Profile | null> => {
    if (profilesCache.has(userId)) {
      return profilesCache.get(userId)!;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    setProfilesCache((prev) => new Map(prev).set(userId, data));
    return data;
  };

  const fetchConversations = async () => {
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .eq("user_id", user.id);

    if (participantError || !participantData) return;

    const conversationIds = participantData.map((p) => p.conversation_id);
    
    const { data: conversationsData, error: conversationsError } = await supabase
      .from("conversations")
      .select("id, updated_at")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (conversationsError || !conversationsData) return;

    const conversationsWithDetails = await Promise.all(
      conversationsData.map(async (conv) => {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.id);

        const otherUserId = participants?.find((p) => p.user_id !== user.id)?.user_id;
        const otherUser = otherUserId ? await getProfile(otherUserId) : null;

        const { data: messagesData } = await supabase
          .from("messages")
          .select("id, content, sender_id, created_at, story_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        return {
          ...conv,
          otherUser,
          lastMessage: messagesData?.[0],
        };
      })
    );

    setConversations(conversationsWithDetails);
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .neq("id", user.id);

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    setAllUsers(data || []);
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from("messages")
      .select("id, content, sender_id, created_at, story_id")
      .eq("conversation_id", selectedConversation)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    const messagesWithProfiles = await Promise.all(
      (data || []).map(async (msg) => {
        const profile = await getProfile(msg.sender_id);
        return {
          ...msg,
          sender_profile: profile || { id: msg.sender_id, full_name: null, avatar_url: null },
        };
      })
    );

    setMessages(messagesWithProfiles);
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        async (payload) => {
          const profile = await getProfile(payload.new.sender_id);
          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              sender_profile: profile || {
                id: payload.new.sender_id,
                full_name: null,
                avatar_url: null,
              },
            } as MessageWithProfile,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createConversation = async (otherUserId: string) => {
    const { data: existingConv } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingConv) {
      for (const conv of existingConv) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", otherUserId)
          .maybeSingle();

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
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return;
    }

    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: otherUserId },
      ]);

    if (participantsError) {
      toast({
        title: "Error",
        description: "Failed to add participants",
        variant: "destructive",
      });
      return;
    }

    setSelectedConversation(conversation.id);
    fetchConversations();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const filteredUsers = allUsers.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);
  const otherUser = selectedConvData?.otherUser;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <Card className="col-span-1 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Messages</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1">
              {searchQuery ? (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        createConversation(u.id);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback>{u.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.full_name || "User"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conv.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={conv.otherUser?.avatar_url || undefined} />
                        <AvatarFallback>{conv.otherUser?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">
                          {conv.otherUser?.full_name || "User"}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-sm opacity-70 truncate">{conv.lastMessage.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          <Card className="col-span-1 md:col-span-2 p-4 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between gap-3 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={otherUser?.avatar_url || undefined} />
                      <AvatarFallback>{otherUser?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">
                      {otherUser?.full_name || "User"}
                    </h3>
                  </div>
                  {otherUser && (
                    <VideoCall
                      conversationId={selectedConversation}
                      userId={user.id}
                      otherUserId={otherUser.id}
                      otherUserName={otherUser.full_name || "User"}
                    />
                  )}
                </div>

                <ScrollArea className="flex-1 py-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 ${
                          msg.sender_id === user.id ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender_profile?.avatar_url || undefined} />
                          <AvatarFallback>{msg.sender_profile?.full_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                         <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.story_id && (
                            <div className="text-xs opacity-70 mb-2 pb-2 border-b border-current/20">
                              📷 Odpoveď na story
                            </div>
                          )}
                          <p className="break-words">{msg.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(msg.created_at).toLocaleTimeString("sk-SK", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Input
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation or start a new one</p>
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
