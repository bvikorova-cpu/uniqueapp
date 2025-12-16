import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Search, MessageCircle, Check, CheckCheck, X, Reply, Mic, Image, Smile, Square, Play, Pause, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoCall from "@/components/messenger/VideoCall";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { OnlineIndicator } from "@/components/messenger/OnlineIndicator";
import { SelfDestructingMessage } from "@/components/messenger/SelfDestructingMessage";
import { GroupChatDialog } from "@/components/messenger/GroupChatDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  reply_to_id?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  voice_duration?: number | null;
  expires_at?: string | null;
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
}

interface MessageWithProfile extends Message {
  sender_profile: Profile;
  reactions?: MessageReaction[];
  reply_to?: Message | null;
}

interface GroupChat {
  id: string;
  name: string;
  avatar_url: string | null;
  created_by: string;
  updated_at: string;
  member_count?: number;
}

interface Conversation {
  id: string;
  updated_at: string;
  otherUser: Profile | null;
  lastMessage?: Message;
}

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

const POPULAR_GIFS = [
  "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
  "https://media.giphy.com/media/3o7TKz2fKpYhu3i168/giphy.gif",
  "https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif",
  "https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif",
  "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
  "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
  "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif",
];

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
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageWithProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selfDestructDuration, setSelfDestructDuration] = useState<number | null>(null);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Online status hook
  const { isUserOnline } = useOnlineStatus(user?.id || null);

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
      fetchGroupChats();
    }
  }, [user]);

  const fetchGroupChats = async () => {
    const { data } = await supabase
      .from("group_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    setGroupChats(data || []);
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const unsubscribeMessages = subscribeToMessages();
      const unsubscribeTyping = subscribeToTyping();
      markMessagesAsRead();
      
      return () => {
        unsubscribeMessages?.();
        unsubscribeTyping?.();
      };
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
          .select("id, content, sender_id, created_at, story_id, is_read")
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
      .select("id, content, sender_id, created_at, story_id, reply_to_id, is_read, read_at")
      .eq("conversation_id", selectedConversation)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    // Fetch reactions for all messages
    const messageIds = (data || []).map(m => m.id);
    const { data: reactionsData } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    const messagesWithProfiles = await Promise.all(
      (data || []).map(async (msg) => {
        const profile = await getProfile(msg.sender_id);
        const reactions = reactionsData?.filter(r => r.message_id === msg.id) || [];
        
        // Get reply-to message if exists
        let replyTo = null;
        if (msg.reply_to_id) {
          const replyMsg = data?.find(m => m.id === msg.reply_to_id);
          if (replyMsg) {
            const replyProfile = await getProfile(replyMsg.sender_id);
            replyTo = { ...replyMsg, sender_profile: replyProfile };
          }
        }
        
        return {
          ...msg,
          sender_profile: profile || { id: msg.sender_id, full_name: null, avatar_url: null },
          reactions,
          reply_to: replyTo,
        };
      })
    );

    setMessages(messagesWithProfiles);
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return;

    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", selectedConversation)
      .neq("sender_id", user.id)
      .eq("is_read", false);
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
              reactions: [],
            } as MessageWithProfile,
          ]);
          
          // Mark as read if it's from other user
          if (payload.new.sender_id !== user.id) {
            markMessagesAsRead();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          fetchMessages(); // Refresh to get updated reactions
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`typing:${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).user_id !== user.id) {
            setOtherUserTyping((payload.new as any).is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateTypingStatus = useCallback(async (typing: boolean) => {
    if (!selectedConversation || !user) return;

    try {
      await supabase
        .from("typing_indicators")
        .upsert({
          conversation_id: selectedConversation,
          user_id: user.id,
          is_typing: typing,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'conversation_id,user_id'
        });
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  }, [selectedConversation, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  const addReaction = async (messageId: string, reaction: string) => {
    try {
      const { data: existing } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("reaction", reaction)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existing.id);
      } else {
        await supabase
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction,
          });
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
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

    // Stop typing indicator
    setIsTyping(false);
    updateTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const expiresAt = selfDestructDuration && selfDestructDuration > 0
      ? new Date(Date.now() + selfDestructDuration * 1000).toISOString()
      : null;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim(),
      reply_to_id: replyingTo?.id || null,
      expires_at: expiresAt,
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
    setReplyingTo(null);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceMessage(audioBlob, recordingDuration);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const uploadVoiceMessage = async (blob: Blob, duration: number) => {
    if (!selectedConversation || !user) return;

    const fileName = `${user.id}/${Date.now()}.webm`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('messenger-attachments')
      .upload(fileName, blob);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload voice message",
        variant: "destructive",
      });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('messenger-attachments')
      .getPublicUrl(fileName);

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: "🎤 Voice message",
      attachment_url: urlData.publicUrl,
      attachment_type: "voice",
      voice_duration: duration,
      reply_to_id: replyingTo?.id || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    }
    setReplyingTo(null);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || !user) return;

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('messenger-attachments')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('messenger-attachments')
      .getPublicUrl(fileName);

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: "📷 Image",
      attachment_url: urlData.publicUrl,
      attachment_type: "image",
      reply_to_id: replyingTo?.id || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send image",
        variant: "destructive",
      });
    }
    setReplyingTo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // GIF sending
  const sendGif = async (gifUrl: string) => {
    if (!selectedConversation || !user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: "GIF",
      attachment_url: gifUrl,
      attachment_type: "gif",
      reply_to_id: replyingTo?.id || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send GIF",
        variant: "destructive",
      });
    }
    setShowGifPicker(false);
    setReplyingTo(null);
  };

  // Audio playback
  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    let audio = audioRefs.current.get(messageId);
    
    if (!audio) {
      audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audioRefs.current.set(messageId, audio);
    }

    if (playingAudio === messageId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = audioRefs.current.get(playingAudio);
        currentAudio?.pause();
      }
      audio.play();
      setPlayingAudio(messageId);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredUsers = allUsers.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);
  const otherUser = selectedConvData?.otherUser;

  const getReactionCount = (reactions: MessageReaction[] | undefined, reaction: string) => {
    return reactions?.filter(r => r.reaction === reaction).length || 0;
  };

  const hasUserReacted = (reactions: MessageReaction[] | undefined, reaction: string) => {
    return reactions?.some(r => r.reaction === reaction && r.user_id === user?.id) || false;
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <Card className="col-span-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Messages</h2>
              </div>
              <GroupChatDialog userId={user?.id} allUsers={allUsers} onGroupCreated={fetchGroupChats} />
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
                      <Avatar className="relative">
                        <AvatarImage src={conv.otherUser?.avatar_url || undefined} />
                        <AvatarFallback>{conv.otherUser?.full_name?.[0] || "U"}</AvatarFallback>
                        {conv.otherUser && (
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                            isUserOnline(conv.otherUser.id) ? "bg-green-500" : "bg-muted-foreground/50"
                          }`} />
                        )}
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">
                          {conv.otherUser?.full_name || "User"}
                        </p>
                        {conv.lastMessage && (
                          <div className="flex items-center gap-1">
                            <p className="text-sm opacity-70 truncate flex-1">{conv.lastMessage.content}</p>
                            {conv.lastMessage.sender_id === user?.id && (
                              conv.lastMessage.is_read ? (
                                <CheckCheck className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              ) : (
                                <Check className="h-3 w-3 opacity-50 flex-shrink-0" />
                              )
                            )}
                          </div>
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
                    <div>
                      <h3 className="text-xl font-semibold">
                        {otherUser?.full_name || "User"}
                      </h3>
                      <div className="flex items-center gap-2">
                        {otherUser && <OnlineIndicator isOnline={isUserOnline(otherUser.id)} showLabel />}
                        {otherUserTyping && (
                          <span className="text-sm text-muted-foreground animate-pulse">typing...</span>
                        )}
                      </div>
                    </div>
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
                        className={`flex items-start gap-2 group ${
                          msg.sender_id === user.id ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender_profile?.avatar_url || undefined} />
                          <AvatarFallback>{msg.sender_profile?.full_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 max-w-[70%]">
                          {/* Reply reference */}
                          {msg.reply_to && (
                            <div className={`text-xs px-2 py-1 rounded bg-muted/50 border-l-2 border-primary ${
                              msg.sender_id === user.id ? "ml-auto" : ""
                            }`}>
                              <span className="font-medium">{(msg.reply_to as any).sender_profile?.full_name || "User"}</span>
                              <p className="truncate opacity-70">{msg.reply_to.content}</p>
                            </div>
                          )}
                          
                          <div className={`relative rounded-lg p-3 ${
                            msg.sender_id === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}>
                            {msg.story_id && (
                              <div className="text-xs opacity-70 mb-2 pb-2 border-b border-current/20">
                                📷 Story reply
                              </div>
                            )}
                            
                            {/* Voice message */}
                            {msg.attachment_type === "voice" && msg.attachment_url && (
                              <div className="flex items-center gap-2 mb-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleAudioPlayback(msg.id, msg.attachment_url!)}
                                >
                                  {playingAudio === msg.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="flex-1 h-1 bg-background/30 rounded-full">
                                  <div className="h-full w-0 bg-current rounded-full" />
                                </div>
                                <span className="text-xs">{formatDuration(msg.voice_duration || 0)}</span>
                              </div>
                            )}
                            
                            {/* Image */}
                            {msg.attachment_type === "image" && msg.attachment_url && (
                              <img
                                src={msg.attachment_url}
                                alt="Shared image"
                                className="rounded-lg max-w-full max-h-64 object-cover mb-2 cursor-pointer"
                                onClick={() => window.open(msg.attachment_url!, '_blank')}
                              />
                            )}
                            
                            {/* GIF */}
                            {msg.attachment_type === "gif" && msg.attachment_url && (
                              <img
                                src={msg.attachment_url}
                                alt="GIF"
                                className="rounded-lg max-w-full max-h-48 object-cover mb-2"
                              />
                            )}
                            
                            {/* Text content (hide for voice-only messages) */}
                            {msg.attachment_type !== "voice" && msg.attachment_type !== "image" && msg.attachment_type !== "gif" && (
                              <p className="break-words">{msg.content}</p>
                            )}
                            
                            <div className="flex items-center justify-between mt-1 gap-2">
                              <span className="text-xs opacity-70">
                                {new Date(msg.created_at).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {msg.sender_id === user.id && (
                                msg.is_read ? (
                                  <CheckCheck className="h-3 w-3 text-blue-400" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-50" />
                                )
                              )}
                            </div>
                            
                            {/* Reactions display */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 -mb-1">
                                {REACTIONS.map(reaction => {
                                  const count = getReactionCount(msg.reactions, reaction);
                                  if (count === 0) return null;
                                  return (
                                    <button
                                      key={reaction}
                                      onClick={() => addReaction(msg.id, reaction)}
                                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        hasUserReacted(msg.reactions, reaction)
                                          ? "bg-primary/20"
                                          : "bg-background/50"
                                      }`}
                                    >
                                      {reaction} {count}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                            msg.sender_id === user.id ? "justify-end" : ""
                          }`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyingTo(msg)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  😊
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <div className="flex gap-1">
                                  {REACTIONS.map(reaction => (
                                    <button
                                      key={reaction}
                                      onClick={() => addReaction(msg.id, reaction)}
                                      className="text-xl hover:scale-125 transition-transform p-1"
                                    >
                                      {reaction}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Reply preview */}
                {replyingTo && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-t-lg border-l-2 border-primary">
                    <Reply className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-medium">{replyingTo.sender_profile.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className={`flex items-center gap-2 pt-4 ${replyingTo ? "" : "border-t"}`}>
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {/* Image upload button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRecording}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  
                  {/* GIF picker */}
                  <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isRecording}>
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2">
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {POPULAR_GIFS.map((gif, index) => (
                          <img
                            key={index}
                            src={gif}
                            alt="GIF"
                            className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => sendGif(gif)}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Self-destructing message toggle */}
                  <SelfDestructingMessage
                    onSelectDuration={(duration) => setSelfDestructDuration(duration === 0 ? null : duration)}
                    isActive={selfDestructDuration !== null && selfDestructDuration > 0}
                    duration={selfDestructDuration}
                  />
                  
                  {/* Voice recording button */}
                  <Button
                    variant={isRecording ? "destructive" : "ghost"}
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {isRecording && (
                    <span className="text-sm text-destructive animate-pulse">
                      {formatDuration(recordingDuration)}
                    </span>
                  )}
                  
                  <Input
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isRecording}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon" disabled={isRecording || !newMessage.trim()}>
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
