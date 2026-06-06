import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Check, CheckCheck, Settings2, Download, AlertOctagon, ShieldX, Timer } from "lucide-react";
import { ChatSafetyMenu } from "./ChatSafetyMenu";
import { useChatSafety } from "@/hooks/useChatSafety";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { DailyQuestion } from "./DailyQuestion";
import { ConversationCoach } from "./ConversationCoach";
import { RevealLock } from "./RevealLock";
import { SafeWordSettings } from "./SafeWordSettings";
import { exportChatToPDF } from "@/lib/exportChatPDF";

interface MatchInfo {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string | null;
  created_at: string | null;
  reveal_request_at: string | null;
  reveal_request_by: string | null;
  match_interests?: string[] | null;
}

interface Props {
  match: MatchInfo;
  currentUserId: string;
  myName: string;
  partnerName: string;
  credits: number;
}

export const AnonymousChat = ({ match, currentUserId, myName, partnerName, credits }: Props) => {
  const { toast } = useToast();
  const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
  const isUser1 = match.user1_id === currentUserId;

  const { messages, reactions, partnerTyping, partnerOnline, loading, sendMessage, broadcastTyping, toggleReaction } =
    useAnonymousChat(match.id, currentUserId, partnerId);
  const { myMeta, partnerMeta, setMood, setTheme, bumpStreak } = useMatchMeta(match.id, currentUserId);

  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const [safeWord, setSafeWord] = useState<string | null>(null);
  const [matchState, setMatchState] = useState(match);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 24h countdown
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    const tick = () => {
      if (!match.created_at) return;
      const end = new Date(match.created_at).getTime() + 24 * 60 * 60 * 1000;
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setUrgent(true);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
      setUrgent(diff < 6 * 3600000);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [match.created_at]);

  const safety = useChatSafety(currentUserId, partnerId);

  // Live match updates (reveal request, status)
  useEffect(() => {
    const ch = supabase.channel(`match-state:${match.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "anonymous_dating_matches", filter: `id=eq.${match.id}` },
        (payload) => setMatchState(prev => ({ ...prev, ...(payload.new as any) })))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [match.id]);

  // Load own safe-word
  useEffect(() => {
    supabase.from("anonymous_dating_safe_words")
      .select("safe_word").eq("match_id", match.id).eq("user_id", currentUserId).maybeSingle()
      .then(({ data }) => setSafeWord(data?.safe_word ?? null));
    const ch = supabase.channel(`safe-word:${match.id}:${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_dating_safe_words", filter: `match_id=eq.${match.id}` },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (row?.user_id === currentUserId) setSafeWord(payload.eventType === "DELETE" ? null : row.safe_word);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [match.id, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, partnerTyping]);

  const [moderating, setModerating] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (safety.isBlocked) {
      toast({
        title: "Chat blocked",
        description: safety.blockedByMe
          ? "You blocked this user. Unblock them to continue."
          : "This conversation is no longer available.",
        variant: "destructive",
      });
      return;
    }

    // Safe word check
    if (safeWord && text.toLowerCase().includes(safeWord)) {
      setInput("");
      setChatLocked(true);
      toast({ title: "Safe word triggered", description: "Chat closed for your safety.", variant: "destructive" });
      return;
    }

    // AI pre-send moderation
    setModerating(true);
    try {
      const { data: mod } = await supabase.functions.invoke("dating-moderate-message", {
        body: { content: text },
      });
      if (mod && mod.allow === false) {
        toast({
          title: "Message blocked",
          description: mod.reason || "This message violates our safety policy.",
          variant: "destructive",
        });
        return;
      }
    } catch (err) {
      console.warn("moderation failed, allowing", err);
    } finally {
      setModerating(false);
    }

    setInput("");
    await sendMessage(text);
    bumpStreak();
  };

  const downloadPDF = () => {
    exportChatToPDF({ messages, currentUserId, myName, partnerName, matchCreatedAt: match.created_at ?? undefined });
    toast({ title: "PDF exported", description: "Your chat memory was downloaded." });
  };

  const theme = myMeta?.theme ?? "midnight";
  const voiceMessageSent = messages.some(m => m.message_type === "voice");
  const matchAgeHours = match.created_at ? (Date.now() - new Date(match.created_at).getTime()) / 3600000 : 0;
  const sharedStreak = Math.max(myMeta?.streak_count ?? 0, partnerMeta?.streak_count ?? 0);

  if (chatLocked) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-destructive/15 to-card border-destructive/40">
        <AlertOctagon className="h-12 w-12 mx-auto text-destructive mb-3" />
        <h3 className="text-lg font-black mb-1">Chat Closed</h3>
        <p className="text-sm text-muted-foreground">
          You triggered your safe word. The conversation is locked for your safety.
        </p>
      </Card>
    );
  }

  if (safety.isBlocked) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-destructive/15 to-card border-destructive/40 space-y-3">
        <ShieldX className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="text-lg font-black">
          {safety.blockedByMe ? "You blocked this user" : "Conversation unavailable"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {safety.blockedByMe
            ? "Messaging is disabled. You can unblock them to resume the conversation, or keep them blocked permanently."
            : "This conversation is no longer available. The other user has restricted contact."}
        </p>
        {safety.blockedByMe && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => safety.unblock()}
            disabled={safety.submitting}
            className="mx-auto"
          >
            Unblock user
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className={`flex flex-col h-[calc(100vh-16rem)] max-h-[640px] overflow-hidden bg-gradient-to-br ${themeGradient(theme)} backdrop-blur-xl border-primary/20 shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/25 backdrop-blur-md">
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
            <Badge variant="outline" className="text-[10px] border-white/30 text-white">Anon</Badge>
            <button onClick={downloadPDF} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white" title="Export PDF">
              <Download className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setShowSettings(s => !s)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white" title="Settings">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            <ChatSafetyMenu
              blockedByMe={safety.blockedByMe}
              submitting={safety.submitting}
              onReport={({ reason, details }) =>
                safety.report({ reason, details, matchId: match.id })
              }
              onBlock={safety.block}
              onUnblock={safety.unblock}
            />
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/50 backdrop-blur-sm">
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
        <form onSubmit={handleSend} className="p-2 border-t border-white/10 bg-black/25 backdrop-blur-md flex items-center gap-1">
          <Input
            value={input}
            onChange={(e) => { setInput(e.target.value); broadcastTyping(); }}
            placeholder={safeWord ? `Type… (safe word active)` : "Type anonymously…"}
            className="flex-1 bg-background/70 border-border/50"
          />
          <VoiceRecorderButton
            userId={currentUserId}
            onUploaded={(url) => { sendMessage("🎤 Voice message", "voice", url); bumpStreak(); }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || moderating} className="rounded-full bg-gradient-to-r from-primary to-pink-500">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Live stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <CompatibilityMeter messageCount={messages.length} matchInterests={matchState.match_interests ?? []} />
        <ConversationMilestones
          messageCount={messages.length}
          matchAgeHours={matchAgeHours}
          voiceMessageSent={voiceMessageSent}
        />
      </div>

      {/* Reveal lock */}
      <RevealLock
        matchId={match.id}
        currentUserId={currentUserId}
        partnerName={partnerName}
        revealRequestAt={matchState.reveal_request_at}
        revealRequestBy={matchState.reveal_request_by}
        status={matchState.status ?? "active"}
      />

      {/* Daily AI question */}
      <DailyQuestion
        matchId={match.id}
        currentUserId={currentUserId}
        isUser1={isUser1}
        partnerName={partnerName}
        credits={credits}
      />

      {/* AI Coach */}
      <ConversationCoach
        matchId={match.id}
        messages={messages}
        currentUserId={currentUserId}
        partnerName={partnerName}
        credits={credits}
      />

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
            <SafeWordSettings matchId={match.id} currentUserId={currentUserId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
