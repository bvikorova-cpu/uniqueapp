import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Search, MessageCircle, Check, CheckCheck, X, Reply, Mic, Image, Smile, Square, Play, Pause, Users, BarChart3, Palette, Radio, Clock, ArrowLeft, Download, Brain, Gamepad2, Bell, BellOff, Loader2 } from "lucide-react";
import { useDmMutes } from "@/hooks/useDmMutes";
import { EmojiPicker } from "@/components/messenger/EmojiPicker";

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import VideoCall from "@/components/messenger/VideoCall";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { OnlineIndicator } from "@/components/messenger/OnlineIndicator";
import { SelfDestructingMessage } from "@/components/messenger/SelfDestructingMessage";
import { EncryptionBadge } from "@/components/messaging/EncryptionBadge";
import { GroupChatDialog } from "@/components/messenger/GroupChatDialog";
import { MessengerAIFeatures } from "@/components/messenger/MessengerAIFeatures";
import { MessengerHero } from "@/components/messenger/MessengerHero";
import PushOptInButton from "@/components/notifications/PushOptInButton";
import { ChatAnalyticsDashboard } from "@/components/messenger/ChatAnalyticsDashboard";
import { AIChatThemes } from "@/components/messenger/AIChatThemes";
import { VoiceRoom } from "@/components/messenger/VoiceRoom";
import { MessageScheduler } from "@/components/messenger/MessageScheduler";
import { ReadReceiptsAnalytics } from "@/components/messenger/ReadReceiptsAnalytics";
import { ChatBackupExport } from "@/components/messenger/ChatBackupExport";
import { AIMoodDetection } from "@/components/messenger/AIMoodDetection";
import { CustomEmojiCreator } from "@/components/messenger/CustomEmojiCreator";
import { ChatGames } from "@/components/messenger/ChatGames";
import { SmartNotifications } from "@/components/messenger/SmartNotifications";
import { motion } from "framer-motion";
import { playMessageChime } from "@/lib/messageChime";
import {
  requestNotificationPermission,
  showMessageNotification,
  incrementUnreadBadge,
  installUnreadBadgeAutoClear,
  clearUnreadBadge,
} from "@/lib/messageNotifications";
import {
  fetchProfileCached,
  fetchProfilesCachedBatch,
  primeProfileCache,
} from "@/lib/profileCache";
import { sanitizeMessageContent, checkRateLimit, MAX_MESSAGE_LEN } from "@/lib/messageSafety";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MessengerView = "hub" | "chat" | "analytics" | "themes" | "voice" | "scheduler" | "receipts" | "backup" | "mood" | "emoji" | "games" | "notifications";

const messengerTools = [
  { id: "chat" as MessengerView, icon: MessageCircle, title: "Open Chat", description: "Real-time messaging with all features", color: "cyan", badge: "Core" },
  { id: "analytics" as MessengerView, icon: BarChart3, title: "Chat Analytics", description: "Message stats, patterns & insights", color: "blue", badge: "New" },
  { id: "themes" as MessengerView, icon: Palette, title: "Chat Themes", description: "AI-generated themes & wallpapers", color: "purple", badge: "AI" },
  { id: "voice" as MessengerView, icon: Radio, title: "Voice Rooms", description: "Drop-in live audio conversations", color: "emerald", badge: "Live" },
  { id: "scheduler" as MessengerView, icon: Clock, title: "Message Scheduler", description: "Schedule messages for later delivery", color: "amber", badge: "New" },
  { id: "receipts" as MessengerView, icon: CheckCheck, title: "Read Receipts", description: "Who reads your messages fastest?", color: "teal", badge: "New" },
  { id: "backup" as MessengerView, icon: Download, title: "Backup & Export", description: "Download chats as TXT, JSON or PDF", color: "slate", badge: "New" },
  { id: "mood" as MessengerView, icon: Brain, title: "Mood Detection", description: "AI analysis of your emotional tone", color: "rose", badge: "AI" },
  { id: "emoji" as MessengerView, icon: Smile, title: "Emoji Creator", description: "Design custom emojis for chats", color: "pink", badge: "New" },
  { id: "games" as MessengerView, icon: Gamepad2, title: "Chat Games", description: "Trivia, RPS & more mini-games", color: "indigo", badge: "Fun" },
  { id: "notifications" as MessengerView, icon: Bell, title: "Smart Notifications", description: "AI-powered notification management", color: "lime", badge: "AI" },
];

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


const Messenger = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<MessengerView>("hub");
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [profilesCache, setProfilesCache] = useState<Map<string, Profile>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageWithProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selfDestructDuration, setSelfDestructDuration] = useState<number | null>(null);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const [selectedMessageText, setSelectedMessageText] = useState<string>("");
  const [totalMessages, setTotalMessages] = useState(0);
  const [friendsOnlineCount, setFriendsOnlineCount] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Track browser online/offline so we can show a banner inside the chat.
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Ask for browser notification permission once + auto-clear unread tab badge on focus.
  useEffect(() => {
    requestNotificationPermission();
    const cleanup = installUnreadBadgeAutoClear();
    return () => {
      cleanup();
      clearUnreadBadge();
    };
  }, []);


  // Online status hook
  const { isUserOnline } = useOnlineStatus(user?.id || null);

  // Real "friends online" = unique conversation partners currently online
  useEffect(() => {
    const partnerIds = new Set<string>();
    conversations.forEach((c) => { if (c.otherUser?.id) partnerIds.add(c.otherUser.id); });
    let online = 0;
    partnerIds.forEach((id) => { if (isUserOnline(id)) online++; });
    setFriendsOnlineCount(online);
  }, [conversations, isUserOnline]);

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

  useEffect(() => {
    if (!user) return;
    const refresh = () => fetchConversations();
    window.addEventListener("focus", refresh);
    window.addEventListener("messages-read", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("messages-read", refresh);
    };
  }, [user]);

  // Server-side search by name so we can find anyone, not just the first 1000 cached profiles.
  // Debounced + cached + stale-response guarded.
  const searchCacheRef = useRef<Map<string, Profile[]>>(new Map());
  const searchSeqRef = useRef(0);
  useEffect(() => {
    if (!user) return;
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    // Serve from cache instantly if available.
    const cached = searchCacheRef.current.get(q);
    if (cached) {
      setSearchResults(cached);
      setSearching(false);
      return;
    }

    setSearching(true);
    const mySeq = ++searchSeqRef.current;
    const handle = setTimeout(async () => {
      const { data, error } = await (supabase as any).rpc("search_users", { q: q, lim: 20 });
      // Drop stale responses (user typed again before this resolved).
      if (mySeq !== searchSeqRef.current) return;
      if (!error) {
        const rows = (((data as any[]) || []).filter((p) => p.id !== user.id)) as Profile[];
        // Cache (cap to ~50 queries to avoid unbounded growth).
        if (searchCacheRef.current.size > 50) searchCacheRef.current.clear();
        searchCacheRef.current.set(q, rows);
        // Warm shared profile cache so opening the chat is instant.
        primeProfileCache(rows as any);
        setSearchResults(rows);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery, user]);




  const fetchGroupChats = async () => {
    const { data } = await supabase
      .from("group_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    setGroupChats(data || []);
  };

  useEffect(() => {
    if (selectedConversation) {
      // Clear previous conversation messages immediately so the new
      // conversation always starts fresh and history is reloaded.
      setMessages([]);
      setLoadingMessages(true);
      setMessagesError(false);
      fetchMessages();
      const unsubscribeMessages = subscribeToMessages();
      const unsubscribeTyping = subscribeToTyping();
      markMessagesAsRead();

      return () => {
        unsubscribeMessages?.();
        unsubscribeTyping?.();
      };
    } else {
      setMessages([]);
      setLoadingMessages(false);
      setMessagesError(false);
    }
  }, [selectedConversation]);

  // Smooth-scroll only when a NEW message arrives.
  // On conversation switch we jump instantly (no animation).
  const prevMessagesLenRef = useRef(0);
  const prevConvRef = useRef<string | null>(null);
  useEffect(() => {
    const convChanged = prevConvRef.current !== selectedConversation;
    const grew = messages.length > prevMessagesLenRef.current;
    if (convChanged) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else if (grew) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLenRef.current = messages.length;
    prevConvRef.current = selectedConversation;
  }, [messages, selectedConversation]);

  const getProfile = async (userId: string): Promise<Profile | null> => {
    const fromState = profilesCache.get(userId);
    if (fromState) return fromState;

    const data = await fetchProfileCached(userId);
    if (!data) return null;

    setProfilesCache((prev) => {
      if (prev.has(userId)) return prev;
      return new Map(prev).set(userId, data);
    });
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

    const { count: sentCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", user.id);
    setTotalMessages(sentCount || 0);
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from("public_profiles")
      .select("id, full_name, avatar_url")
      .neq("id", user.id);

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    const users = ((data || []) as Profile[]).filter((profile) => Boolean(profile.id));
    primeProfileCache(users);
    setAllUsers(users);
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const convId = selectedConversation;
    setLoadingMessages(true);
    setMessagesError(false);
    const { data, error } = await supabase
      .from("messages")
      .select("id, content, sender_id, created_at, story_id, reply_to_id, is_read, read_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("Error fetching messages:", error);
      if (convId === selectedConversation) {
        setMessagesError(true);
        setLoadingMessages(false);
      }
      return;
    }

    const rows = data || [];

    // Fetch reactions only if there are messages.
    let reactionsData: any[] = [];
    if (rows.length > 0) {
      const { data: rd } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", rows.map((m) => m.id));
      reactionsData = rd || [];
    }

    // Batch-fetch all sender profiles using the shared module cache
    // (hits network only for missing ids).
    const senderIds = Array.from(new Set(rows.map((m) => m.sender_id)));
    const profilesMap = senderIds.length > 0
      ? await fetchProfilesCachedBatch(senderIds)
      : new Map<string, any>();

    const messagesWithProfiles = rows.map((msg) => {
      const profile = profilesMap.get(msg.sender_id) || {
        id: msg.sender_id,
        full_name: null,
        avatar_url: null,
      };
      const reactions = reactionsData.filter((r) => r.message_id === msg.id);

      let replyTo: any = null;
      if (msg.reply_to_id) {
        const replyMsg = rows.find((m) => m.id === msg.reply_to_id);
        if (replyMsg) {
          replyTo = {
            ...replyMsg,
            sender_profile:
              profilesMap.get(replyMsg.sender_id) || {
                id: replyMsg.sender_id,
                full_name: null,
                avatar_url: null,
              },
          };
        }
      }

      return {
        ...msg,
        sender_profile: profile,
        reactions,
        reply_to: replyTo,
      };
    });

    // Guard: if user switched conversations during the fetch, ignore stale results.
    if (convId !== selectedConversation) return;
    setMessages(messagesWithProfiles);
    setLoadingMessages(false);
    setMessagesError(false);
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return;

    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", selectedConversation)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", selectedConversation)
      .eq("user_id", user.id);

    window.dispatchEvent(new CustomEvent("messages-read"));
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`user:${user.id}:messages:${selectedConversation}`)
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
          
          // Mark as read + play unique chime if it's from other user
          if (payload.new.sender_id !== user.id) {
            playMessageChime();
            markMessagesAsRead();
            // Background notification + tab title badge when tab is hidden/blurred
            const senderName = profile?.full_name || "New message";
            const body = (payload.new as any).content || "Sent you a message";
            showMessageNotification(senderName, String(body).slice(0, 140), profile?.avatar_url || undefined);
            incrementUnreadBadge();
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
        async (payload) => {
          // Surgical: only refresh reactions for the affected message
          // instead of re-fetching the entire conversation.
          const row: any = (payload.new as any) || (payload.old as any);
          const messageId = row?.message_id;
          if (!messageId) return;
          const { data } = await supabase
            .from("message_reactions")
            .select("*")
            .eq("message_id", messageId);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, reactions: data || [] } : m
            )
          );
        }
      )
      .subscribe((status) => {
        // When (re)connected, refetch to catch any messages we missed while offline.
        if (status === "SUBSCRIBED") {
          fetchMessages();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`user:${user.id}:typing:${selectedConversation}`)
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
            const isTyping = (payload.new as any).is_typing;
            setOtherUserTyping(isTyping);

            // Safety: auto-clear typing indicator after 3s of silence
            // in case the "stopped typing" event never arrives.
            if (otherTypingTimeoutRef.current) {
              clearTimeout(otherTypingTimeoutRef.current);
            }
            if (isTyping) {
              otherTypingTimeoutRef.current = setTimeout(() => {
                setOtherUserTyping(false);
              }, 3000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
        otherTypingTimeoutRef.current = null;
      }
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

    const newConvId = (crypto as any).randomUUID();
    const { error: convError } = await supabase
      .from("conversations")
      .insert({ id: newConvId, created_by: user.id });

    if (convError) {
      console.error("createConversation insert error:", convError);
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
        { conversation_id: newConvId, user_id: user.id },
        { conversation_id: newConvId, user_id: otherUserId },
      ]);

    if (participantsError) {
      console.error("createConversation participants error:", participantsError);
      toast({
        title: "Error",
        description: "Failed to add participants",
        variant: "destructive",
      });
      return;
    }

    setSelectedConversation(newConvId);
    fetchConversations();
  };


  const sendMessage = async (overrideText?: string, overrideReplyId?: string | null) => {
    const text = sanitizeMessageContent(overrideText ?? newMessage);
    if (!text || !selectedConversation || !user) return;

    // Client-side rate limit: max 10 messages / 10s per user.
    const rl = checkRateLimit(`send:${user.id}`, 10, 10_000);
    if (!rl.ok) {
      toast({
        title: "Slow down",
        description: `Too many messages. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.`,
        variant: "destructive",
      });
      return;
    }


    // Stop typing indicator
    setIsTyping(false);
    updateTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const expiresAt = selfDestructDuration && selfDestructDuration > 0
      ? new Date(Date.now() + selfDestructDuration * 1000).toISOString()
      : null;

    const replyId = overrideReplyId !== undefined ? overrideReplyId : (replyingTo?.id || null);

    // Optimistically clear the input so the user can keep typing.
    if (overrideText === undefined) {
      setNewMessage("");
      setReplyingTo(null);
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: text,
      reply_to_id: replyId,
      expires_at: expiresAt,
    });

    if (error) {
      // Restore the text so nothing is lost, and offer a retry.
      setNewMessage((prev) => (prev ? prev : text));
      toast({
        title: "Message not sent",
        description: !isOnline
          ? "You're offline. Tap retry once you're back online."
          : "Couldn't reach the server. Tap retry to try again.",
        variant: "destructive",
        action: (
          <ToastAction altText="Retry" onClick={() => sendMessage(text, replyId)}>
            Retry
          </ToastAction>
        ),
      });
      return;
    }

    // Input was already cleared optimistically above.
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

  const filteredUsers = searchResults;


  const selectedConvData = conversations.find((c) => c.id === selectedConversation);
  const otherUser = selectedConvData?.otherUser;

  const getReactionCount = (reactions: MessageReaction[] | undefined, reaction: string) => {
    return reactions?.filter(r => r.reaction === reaction).length || 0;
  };

  const hasUserReacted = (reactions: MessageReaction[] | undefined, reaction: string) => {
    return reactions?.some(r => r.reaction === reaction && r.user_id === user?.id) || false;
  };

  const goToHub = () => setActiveView("hub");

  const renderToolView = () => {
    if (!user) return null;
    switch (activeView) {
      case "analytics": return <ChatAnalyticsDashboard onBack={goToHub} userId={user.id} />;
      case "themes": return <AIChatThemes onBack={goToHub} userId={user.id} />;
      case "voice": return <VoiceRoom onBack={goToHub} userId={user.id} />;
      case "scheduler": return <MessageScheduler onBack={goToHub} userId={user.id} />;
      case "receipts": return <ReadReceiptsAnalytics onBack={goToHub} userId={user.id} />;
      case "backup": return <ChatBackupExport onBack={goToHub} userId={user.id} />;
      case "mood": return <AIMoodDetection onBack={goToHub} userId={user.id} />;
      case "emoji": return <CustomEmojiCreator onBack={goToHub} userId={user.id} />;
      case "games": return <ChatGames onBack={goToHub} userId={user.id} />;
      case "notifications": return <SmartNotifications onBack={goToHub} userId={user.id} />;
      default: return null;
    }
  };

  // Hub view with hero + tools
  if (activeView !== "hub" && activeView !== "chat") {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {renderToolView()}
        </div>
      </div>
    );
  }

  if (activeView === "hub") {
    const colorMap: Record<string, string> = {
      cyan: "from-cyan-500 to-blue-500",
      blue: "from-blue-500 to-indigo-500",
      purple: "from-purple-500 to-pink-500",
      emerald: "from-emerald-500 to-teal-500",
      amber: "from-amber-500 to-orange-500",
      teal: "from-teal-500 to-cyan-500",
      slate: "from-slate-500 to-gray-500",
      rose: "from-rose-500 to-pink-500",
      pink: "from-pink-500 to-fuchsia-500",
      indigo: "from-indigo-500 to-violet-500",
      lime: "from-lime-500 to-green-500",
    };

    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <MessengerHero
            onOpenChat={() => setActiveView("chat")}
            stats={{
              totalMessages,
              activeChats: conversations.length,
              friendsOnline: friendsOnlineCount,
              aiCredits: 50,
            }}
          />

          <div className="mb-6 flex justify-end">
            <PushOptInButton />
          </div>

          {/* Active chats preview — so users see their conversations right on the hub */}
          {conversations.length > 0 && (
            <Card className="mb-8 border-primary/20 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Active Chats
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView("chat")}>
                    See all
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conversations.slice(0, 6).map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv.id);
                        setActiveView("chat");
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={conv.otherUser?.avatar_url || undefined} />
                        <AvatarFallback>{conv.otherUser?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{conv.otherUser?.full_name || "User"}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Tools Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
              Messenger Tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {messengerTools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveView(tool.id)}
                  className="cursor-pointer"
                >
                  <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden group">
                    <CardContent className="p-4 text-center">
                      {tool.badge && (
                        <span className="text-[9px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full mb-2 inline-block">
                          {tool.badge}
                        </span>
                      )}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[tool.color] || "from-primary to-accent"} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xs font-black mb-0.5">{tool.title}</h3>
                      <p className="text-[10px] text-muted-foreground leading-tight">{tool.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Features List */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6">
              <h3 className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">Built-in Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: "💬", label: "Real-time Chat" },
                  { icon: "🎙️", label: "Voice Messages" },
                  { icon: "📸", label: "Image Sharing" },
                  { icon: "😂", label: "Reactions & GIFs" },
                  { icon: "🔥", label: "Self-Destruct" },
                  { icon: "👥", label: "Group Chats" },
                  { icon: "🤖", label: "AI Translation" },
                  { icon: "📊", label: "Smart Replies" },
                ].map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/30"
                  >
                    <span className="text-lg">{feat.icon}</span>
                    <span className="text-xs font-bold">{feat.label}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={goToHub} className="mb-3 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </div>
      <div className="container mx-auto px-4 h-[calc(100vh-10rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <Card className={`col-span-1 p-4 flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
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
                  {searching && filteredUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">Searching…</p>
                  )}
                  {!searching && filteredUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No users found for "{searchQuery}"
                    </p>
                  )}
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
                  {conversations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No active chats yet. Search for a user above to start a conversation.
                    </p>
                  )}
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

          <Card className={`col-span-1 md:col-span-2 p-4 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"}`}>
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between gap-3 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden -ml-2"
                      onClick={() => setSelectedConversation(null)}
                      aria-label="Back to chats"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
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

                {!isOnline && (
                  <div className="px-3 py-2 text-xs text-center bg-destructive/15 text-destructive border-y border-destructive/30">
                    You're offline — messages will send once you're back online.
                  </div>
                )}

                <ScrollArea className="flex-1 py-4">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading messages…
                    </div>
                  ) : messagesError && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
                      <p>Couldn't load messages.</p>
                      <Button size="sm" variant="outline" onClick={() => fetchMessages()}>
                        Retry
                      </Button>
                    </div>
                  ) : null}
                  <div className="space-y-4">
                    {messages.map((msg, idx) => {
                      // Date separator when day changes vs previous message
                      const cur = new Date(msg.created_at);
                      const prev = idx > 0 ? new Date(messages[idx - 1].created_at) : null;
                      const sameDay = prev &&
                        cur.getFullYear() === prev.getFullYear() &&
                        cur.getMonth() === prev.getMonth() &&
                        cur.getDate() === prev.getDate();
                      const today = new Date();
                      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
                      const isToday =
                        cur.getFullYear() === today.getFullYear() &&
                        cur.getMonth() === today.getMonth() &&
                        cur.getDate() === today.getDate();
                      const isYesterday =
                        cur.getFullYear() === yesterday.getFullYear() &&
                        cur.getMonth() === yesterday.getMonth() &&
                        cur.getDate() === yesterday.getDate();
                      const label = isToday ? "Today" : isYesterday ? "Yesterday" :
                        cur.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
                      const separator = !sameDay ? (
                        <div key={`sep-${msg.id}`} className="flex items-center justify-center my-2">
                          <span className="px-3 py-1 rounded-full bg-muted/50 text-[11px] text-muted-foreground uppercase tracking-wide">
                            {label}
                          </span>
                        </div>
                      ) : null;
                      return (
                        <Fragment key={msg.id}>
                          {separator}
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
                        </Fragment>
                      );
                    })}
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

                <div className="flex justify-end pt-2">
                  <EncryptionBadge />
                </div>

                <div className={`pt-2 ${replyingTo ? "" : "border-t"}`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Tool row — scrolls horizontally on narrow screens */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRecording}
                    >
                      <Image className="h-4 w-4" />
                    </Button>

                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0" disabled={isRecording}>
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2">
                        <EmojiPicker onSelect={(emoji) => setNewMessage((prev) => prev + emoji)} />
                      </PopoverContent>
                    </Popover>


                    <div className="shrink-0">
                      <SelfDestructingMessage
                        onSelectDuration={(duration) => setSelfDestructDuration(duration === 0 ? null : duration)}
                        isActive={selfDestructDuration !== null && selfDestructDuration > 0}
                        duration={selfDestructDuration}
                      />
                    </div>

                    {user && (
                      <div className="shrink-0">
                        <MessengerAIFeatures
                          userId={user.id}
                          selectedText={selectedMessageText}
                          messages={messages.map(m => ({
                            sender_id: m.sender_id,
                            content: m.content,
                            sender_name: m.sender_profile?.full_name || undefined,
                          }))}
                          onInsertText={(text) => setNewMessage(text)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Input row */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "ghost"}
                      size="icon"
                      className="shrink-0"
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>

                    {isRecording && (
                      <span className="text-xs text-destructive animate-pulse shrink-0">
                        {formatDuration(recordingDuration)}
                      </span>
                    )}

                    <Input
                      placeholder="Write a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      disabled={isRecording}
                      maxLength={MAX_MESSAGE_LEN}
                      onFocus={(e) => {
                        const el = e.currentTarget;
                        setTimeout(() => {
                          el.scrollIntoView({ block: "center", behavior: "smooth" });
                          messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
                        }, 300);
                      }}
                      className="flex-1 min-w-0"
                    />
                    <Button onClick={() => sendMessage()} size="icon" className="shrink-0" disabled={isRecording || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
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
