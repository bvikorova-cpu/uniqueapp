import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, Search, ChevronLeft, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_profile?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface ChatUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  last_message?: string;
  unread_count?: number;
}

const QUICK_EMOJIS = ["❤️", "😊", "🎁", "✨", "🙏", "💕", "🥰", "👏"];

export const GiftChat = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch chat users (people you've exchanged gifts with)
  const { data: chatUsers = [] } = useQuery({
    queryKey: ["gift-chat-users", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      // Get users from received gifts
      const { data: receivedGifts } = await supabase
        .from("secret_santa_gifts")
        .select("sender_id")
        .eq("recipient_id", currentUserId);

      // Get users from sent gifts
      const { data: sentGifts } = await supabase
        .from("secret_santa_gifts")
        .select("recipient_id")
        .eq("sender_id", currentUserId);

      const partnerIds = Array.from(new Set([
        ...(receivedGifts || []).map((g: any) => g.sender_id),
        ...(sentGifts || []).map((g: any) => g.recipient_id),
      ].filter((id) => id && id !== currentUserId)));

      if (partnerIds.length === 0) return [];

      const { data: profs } = await (supabase as any)
        .from("profiles_public")
        .select("id, username, avatar_url")
        .in("id", partnerIds);

      const userMap = new Map<string, ChatUser>();
      (profs || []).forEach((p: any) => {
        userMap.set(p.id, { id: p.id, username: p.username, avatar_url: p.avatar_url });
      });

      return Array.from(userMap.values());
    },
    enabled: !!currentUserId,
  });

  // Fetch messages for selected user
  const { data: messages = [] } = useQuery({
    queryKey: ["gift-chat-messages", currentUserId, selectedUser?.id],
    queryFn: async () => {
      if (!currentUserId || !selectedUser) return [];

      const { data, error } = await supabase
        .from("gift_chat_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      return data as ChatMessage[];
    },
    enabled: !!currentUserId && !!selectedUser,
    refetchInterval: 3000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId || !selectedUser) throw new Error("Not ready");

      const { error } = await supabase
        .from("gift_chat_messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedUser.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["gift-chat-messages"] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const filteredUsers = chatUsers.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUserId) {
    return (
      <Card className="bg-white/90 backdrop-blur-xl border-amber-200">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-amber-400 mb-4" />
          <p className="text-gray-600">Please log in to use chat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-amber-200 overflow-hidden">
      <div className="flex h-[500px]">
        {/* Users list */}
        <AnimatePresence mode="wait">
          {!selectedUser && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-full border-r border-amber-100"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <MessageCircle className="h-5 w-5 text-amber-500" />
                  Gift Chats
                </CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-amber-50/50 border-amber-200"
                  />
                </div>
              </CardHeader>
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-1">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs mt-1">Send or receive gifts to start chatting!</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.button
                        key={user.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedUser(user)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors text-left"
                      >
                        <Avatar className="h-10 w-10 border-2 border-amber-200">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white">
                            {user.username?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {user.username || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Tap to chat
                          </p>
                        </div>
                        <div className="text-amber-400">🎁</div>
                      </motion.button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {/* Chat view */}
          {selectedUser && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="w-full flex flex-col"
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedUser(null)}
                  className="shrink-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 border-2 border-amber-200">
                  <AvatarImage src={selectedUser.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white">
                    {selectedUser.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">{selectedUser.username || "Anonymous"}</p>
                  <p className="text-xs text-gray-500">Gift friend</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-4xl mb-2 block">💬</span>
                      <p className="text-sm">Start the conversation!</p>
                      <p className="text-xs mt-1">Say thanks or send a message</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                              isMe
                                ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-800 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-gray-400"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick emojis */}
              <div className="px-4 py-2 border-t border-amber-100 flex gap-2 overflow-x-auto">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(prev => prev + emoji)}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-amber-100 bg-white/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-amber-50/50 border-amber-200"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
