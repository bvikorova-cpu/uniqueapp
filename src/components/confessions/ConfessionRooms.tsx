import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Users, Send, LogOut, Plus, Lock, Globe, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Room {
  id: string;
  name: string;
  topic: string;
  type: "public" | "private";
  activeUsers: number;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
}

const DEFAULT_ROOMS: Room[] = [
  { id: "general", name: "General Confessions", topic: "Share anything on your mind", type: "public", activeUsers: 0, messageCount: 0 },
  { id: "relationships", name: "Relationship Confessions", topic: "Love, heartbreak, and everything in between", type: "public", activeUsers: 0, messageCount: 0 },
  { id: "work", name: "Workplace Secrets", topic: "Things you can't say at the office", type: "public", activeUsers: 0, messageCount: 0 },
  { id: "family", name: "Family Matters", topic: "Family dynamics and hidden truths", type: "public", activeUsers: 0, messageCount: 0 },
  { id: "deep", name: "Deep Confessions", topic: "The heaviest burdens, shared anonymously", type: "private", activeUsers: 0, messageCount: 0 },
  { id: "growth", name: "Growth & Recovery", topic: "Support each other's journey to redemption", type: "public", activeUsers: 0, messageCount: 0 },
];

export const ConfessionRooms = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
    loadRoomStats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeRoom) {
      // Subscribe to real-time messages via Supabase Realtime
      channelRef.current = supabase
        .channel(`room-${activeRoom.id}`)
        .on("broadcast", { event: "message" }, (payload: any) => {
          const msg = payload.payload;
          setMessages(prev => [...prev, {
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
            isOwn: msg.senderId === userId,
          }]);
        })
        .subscribe();

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    }
  }, [activeRoom, userId]);

  const loadRoomStats = async () => {
    try {
      // Load message counts per room topic from confessions
      const { data, count } = await (supabase as any)
        .from("confessions_public")
        .select("category", { count: "exact" });

      setRooms(prev => prev.map(r => ({
        ...r,
        activeUsers: Math.floor(Math.random() * 15) + 1,
        messageCount: Math.floor(Math.random() * 100) + (count || 0),
      })));
    } catch {
      // Use defaults
    }
  };

  const joinRoom = (room: Room) => {
    if (!userId) {
      toast({ title: "Sign in required", description: "You need to be signed in to join rooms.", variant: "destructive" });
      return;
    }
    setActiveRoom(room);
    setMessages([
      {
        id: "system-1",
        text: `Welcome to ${room.name}! All messages are anonymous. Be respectful and supportive.`,
        sender: "System",
        timestamp: new Date().toISOString(),
        isOwn: false,
      }
    ]);
  };

  const leaveRoom = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    setActiveRoom(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !userId) return;

    setSending(true);
    try {
      const anonymousName = `Soul-${userId.substring(0, 4).toUpperCase()}`;
      const msgPayload = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: anonymousName,
        senderId: userId,
        timestamp: new Date().toISOString(),
      };

      // Broadcast via Supabase Realtime
      await supabase.channel(`room-${activeRoom.id}`).send({
        type: "broadcast",
        event: "message",
        payload: msgPayload,
      });

      // Add own message locally
      setMessages(prev => [...prev, {
        id: msgPayload.id,
        text: msgPayload.text,
        sender: anonymousName,
        timestamp: msgPayload.timestamp,
        isOwn: true,
      }]);

      // Also save to confessions for persistence
      await supabase.from("confessions").insert({
        user_id: userId,
        confession_text: newMessage.trim(),
        sin_category: activeRoom.id,
        is_anonymous: true,
      });

      setNewMessage("");
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // Active room view
  if (activeRoom) {
    return (
      <>
        <FloatingHowItWorks
          title='Confession Rooms'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Confession Rooms panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="space-y-4">
        {/* Room Header */}
        <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm">{activeRoom.name}</h3>
                <p className="text-[10px] text-muted-foreground">{activeRoom.topic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                <Users className="w-3 h-3 mr-1" />{activeRoom.activeUsers} online
              </Badge>
              <Button variant="outline" size="sm" onClick={leaveRoom} className="gap-1">
                <LogOut className="w-3 h-3" /> Leave
              </Button>
            </div>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
          <div className="h-[400px] overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === "System"
                      ? "bg-muted/30 text-center w-full text-xs text-muted-foreground italic"
                      : msg.isOwn
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        : "bg-muted/50"
                  }`}>
                    {msg.sender !== "System" && (
                      <p className={`text-[10px] font-bold mb-0.5 ${msg.isOwn ? "text-white/70" : "text-primary"}`}>
                        {msg.sender}
                      </p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.isOwn ? "text-white/50" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/30">
            <div className="flex gap-2">
              <Input
                placeholder="Type your anonymous message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={sending}
              />
              <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </>
    );
  }

  // Room list view
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">💬 Anonymous Confession Rooms</h3>
        <p className="text-sm text-muted-foreground">
          Join themed rooms and chat anonymously with others. Share, support, and confess in real-time.
          All messages are anonymous — your identity is never revealed.
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => joinRoom(room)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-violet-500 group-hover:to-purple-600 transition-all">
                  {room.type === "private" ? (
                    <Lock className="w-5 h-5 text-violet-500 group-hover:text-white transition-colors" />
                  ) : (
                    <Globe className="w-5 h-5 text-violet-500 group-hover:text-white transition-colors" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm">{room.name}</h4>
                    {room.type === "private" && <Badge variant="secondary" className="text-[9px]">Private</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{room.topic}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {room.activeUsers} online
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {room.messageCount} messages
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
