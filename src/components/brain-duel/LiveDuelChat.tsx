import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  content: string;
  timestamp: string;
  type: "message" | "emote" | "system";
}

const QUICK_EMOTES = ["👏", "🔥", "😂", "💪", "🎯", "😱", "🏆", "💀"];

interface LiveDuelChatProps {
  matchId?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const LiveDuelChat = ({ matchId, isMinimized: externalMinimized, onToggleMinimize }: LiveDuelChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelName = matchId ? `duel-chat-${matchId}` : "brain-duel-global";

  const isMinimized = externalMinimized ?? minimized;
  const toggleMinimize = onToggleMinimize ?? (() => setMinimized(prev => !prev));

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "chat_message" }, (payload) => {
        const msg = payload.payload as ChatMessage;
        setMessages(prev => [...prev.slice(-99), msg]);
        if (!isOpen || isMinimized) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [channelName, isOpen, isMinimized]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) setUnreadCount(0);
  }, [isOpen, isMinimized]);

  const sendMessage = async (content: string, type: "message" | "emote" = "message") => {
    if (!content.trim() || !user) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      username: user.email?.split("@")[0] || "Player",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type,
    };

    await supabase.channel(channelName).send({
      type: "broadcast",
      event: "chat_message",
      payload: msg,
    });

    setMessages(prev => [...prev.slice(-99), msg]);
    setInput("");
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full bg-primary shadow-lg shadow-primary/30 relative"
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 w-[300px]"
    >
      <Card className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">
              {matchId ? "Duel Chat" : "Global Chat"}
            </span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMinimize}>
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              {/* Messages */}
              <div ref={scrollRef} className="h-[250px] overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No messages yet</p>
                    <p className="text-[10px] mt-1">Say hi or send an emote!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.user_id === user?.id ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.user_id === user?.id ? "justify-end" : ""}`}
                    >
                      {msg.type === "system" ? (
                        <div className="text-[10px] text-muted-foreground text-center w-full italic">
                          {msg.content}
                        </div>
                      ) : msg.type === "emote" ? (
                        <div className="text-2xl">{msg.content}</div>
                      ) : (
                        <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${
                          msg.user_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 border border-border/50"
                        }`}>
                          {msg.user_id !== user?.id && (
                            <span className="font-bold text-primary block text-[10px]">{msg.username}</span>
                          )}
                          {msg.content}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Quick Emotes */}
              <div className="px-3 pb-1 flex gap-1 overflow-x-auto">
                {QUICK_EMOTES.map(e => (
                  <button
                    key={e}
                    onClick={() => sendMessage(e, "emote")}
                    className="text-base hover:scale-125 transition-transform flex-shrink-0"
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-2 border-t border-border/50 flex gap-1.5">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Type..."
                  className="text-xs h-8 bg-muted/10"
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
