import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Check, CheckCheck, Settings2 } from "lucide-react";
import { useAnonymousChat } from "@/hooks/useAnonymousChat";
import { useMatchMeta } from "@/hooks/useMatchMeta";
import { TypingIndicator } from "./TypingIndicator";
import { MessageReactions } from "./MessageReactions";
import { VoiceRecorderButton } from "./VoiceRecorderButton";
import { AnonymousAvatar } from "./AnonymousAvatar";
import { CompatibilityMeter } from "./CompatibilityMeter";
import { StreakBadge } from "./StreakBadge";
import { ConversationMilestones } from "./ConversationMilestones";
import { MoodSelector } from "./MoodSelector";
import { ChatThemePicker, themeGradient } from "./ChatThemePicker";

interface Props {
  matchId: string;
  currentUserId: string;
  partnerId: string;
  partnerName: string;
  matchCreatedAt?: string;
  matchInterests?: string[];
}

export const AnonymousChat = ({ matchId, currentUserId, partnerId, partnerName, matchCreatedAt, matchInterests }: Props) => {
  const { messages, reactions, partnerTyping, partnerOnline, loading, sendMessage, broadcastTyping, toggleReaction } =
    useAnonymousChat(matchId, currentUserId, partnerId);
  const { myMeta, partnerMeta, setMood, setTheme, bumpStreak } = useMatchMeta(matchId, currentUserId);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
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
    bumpStreak();
  };

  const theme = myMeta?.theme ?? "midnight";
  const myMessageCount = messages.filter(m => m.sender_id === currentUserId).length;
  const voiceMessageSent = messages.some(m => m.message_type === "voice");
  const matchAgeHours = matchCreatedAt ? (Date.now() - new Date(matchCreatedAt).getTime()) / 3600000 : 0;
  const sharedStreak = Math.max(myMeta?.streak_count ?? 0, partnerMeta?.streak_count ?? 0);

  return (
    <div className="space-y-3">
      <Card className={`flex flex-col h-[calc(100vh-16rem)] max-h-[640px] overflow-hidden bg-gradient-to-br ${themeGradient(theme)} backdrop-blur-xl border-primary/20 shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AnonymousAvatar seed={partnerName} size={36} online={partnerOnline} />
            <div>
              <p className="font-bold text-sm leading-tight text-white">{partnerName}</p>
              <p className="text-[10px] text-white/70">
                {partnerOnline ? "Online" : "Offline"}
                {partnerMeta?.mood && ` · ${partnerMeta.mood}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <StreakBadge days={sharedStreak} />
            <Badge variant="outline" className="text-[10px] border-white/30 text-white">Anonymous</Badge>
            <button
              onClick={() => setShowSettings(s => !s)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
              aria-label="Chat settings"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/40 backdrop-blur-sm">
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
                      ? "bg-gradient-to-br from-primary to-pink-500 text-white rounded-br-sm shadow-lg"
                      : "bg-card/80 backdrop-blur-md border border-border/40 rounded-bl-sm"
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
        <form onSubmit={handleSend} className="p-2 border-t border-white/10 bg-black/20 backdrop-blur-md flex items-center gap-1">
          <Input
            value={input}
            onChange={(e) => { setInput(e.target.value); broadcastTyping(); }}
            placeholder="Type anonymously…"
            className="flex-1 bg-background/70 border-border/50"
          />
          <VoiceRecorderButton
            userId={currentUserId}
            onUploaded={(url) => { sendMessage("🎤 Voice message", "voice", url); bumpStreak(); }}
          />
          <Button type="submit" size="icon" disabled={!input.trim()} className="rounded-full bg-gradient-to-r from-primary to-pink-500">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Live stats below chat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <CompatibilityMeter messageCount={messages.length} matchInterests={matchInterests} />
        <ConversationMilestones
          messageCount={messages.length}
          matchAgeHours={matchAgeHours}
          voiceMessageSent={voiceMessageSent}
        />
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <MoodSelector current={myMeta?.mood ?? null} onChange={setMood} />
            <ChatThemePicker current={theme} onChange={setTheme} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
