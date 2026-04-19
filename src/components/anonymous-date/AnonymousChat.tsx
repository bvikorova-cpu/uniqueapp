import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Check, CheckCheck, Circle } from "lucide-react";
import { useAnonymousChat } from "@/hooks/useAnonymousChat";
import { TypingIndicator } from "./TypingIndicator";
import { MessageReactions } from "./MessageReactions";
import { VoiceRecorderButton } from "./VoiceRecorderButton";

interface Props {
  matchId: string;
  currentUserId: string;
  partnerId: string;
  partnerName: string;
}

export const AnonymousChat = ({ matchId, currentUserId, partnerId, partnerName }: Props) => {
  const { messages, reactions, partnerTyping, partnerOnline, loading, sendMessage, broadcastTyping, toggleReaction } =
    useAnonymousChat(matchId, currentUserId, partnerId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, partnerTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] max-h-[640px] overflow-hidden bg-gradient-to-br from-card/90 via-card/70 to-primary/5 backdrop-blur-xl border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-sm font-bold text-white">
              {partnerName.slice(0, 2).toUpperCase()}
            </div>
            <Circle
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${partnerOnline ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground/40 text-muted-foreground/40"}`}
            />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{partnerName}</p>
            <p className="text-[10px] text-muted-foreground">{partnerOnline ? "Online now" : "Offline"}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">Anonymous</Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && <p className="text-center text-xs text-muted-foreground py-4">Loading conversation…</p>}
        {!loading && messages.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground italic">
            No messages yet. Break the ice anonymously ✨
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          const msgReactions = reactions.filter(r => r.message_id === m.id);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm break-words ${
                  mine
                    ? "bg-gradient-to-br from-primary to-pink-500 text-white rounded-br-sm"
                    : "bg-muted/60 backdrop-blur-md border border-border/40 rounded-bl-sm"
                }`}
              >
                {m.message_type === "voice" && m.voice_url ? (
                  <audio controls src={m.voice_url} className="max-w-full h-10" />
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
              <div className={`flex items-center gap-1 mt-0.5 px-1 ${mine ? "flex-row-reverse" : ""}`}>
                <span className="text-[9px] text-muted-foreground">
                  {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
                {mine && (
                  m.is_read
                    ? <CheckCheck className="h-3 w-3 text-primary" />
                    : <Check className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <MessageReactions
                messageId={m.id}
                reactions={msgReactions}
                currentUserId={currentUserId}
                onToggle={toggleReaction}
                align={mine ? "right" : "left"}
              />
            </motion.div>
          );
        })}

        <AnimatePresence>
          {partnerTyping && <TypingIndicator name={partnerName} />}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-border/50 bg-card/40 backdrop-blur-md flex items-center gap-1">
        <Input
          value={input}
          onChange={(e) => { setInput(e.target.value); broadcastTyping(); }}
          placeholder="Type anonymously…"
          className="flex-1 bg-background/60 border-border/50"
        />
        <VoiceRecorderButton
          userId={currentUserId}
          onUploaded={(url) => sendMessage("🎤 Voice message", "voice", url)}
        />
        <Button type="submit" size="icon" disabled={!input.trim()} className="rounded-full bg-gradient-to-r from-primary to-pink-500">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};
