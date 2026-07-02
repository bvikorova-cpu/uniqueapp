import { useState, useEffect } from "react";
import { ArrowLeft, PartyPopper, MessageCircle, Send, Users, Music, Mic, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isArtist?: boolean;
  isVIP?: boolean;
}

const ACTIVE_AFTERPARTIES = [
  { id: "1", artist: "Luna Wave", title: "Post-Show Hangout", attendees: 234, status: "live", gradient: "from-violet-500 to-pink-500", emoji: "🎤" },
  { id: "2", artist: "DJ Pulse", title: "After Dark Lounge", attendees: 156, status: "live", gradient: "from-blue-500 to-cyan-500", emoji: "🎧" },
  { id: "3", artist: "The Vibes", title: "Acoustic Chill Zone", attendees: 89, status: "starting_soon", gradient: "from-emerald-500 to-teal-500", emoji: "🎹" },
];

const PARTY_FEATURES = [
  { icon: "🎵", title: "Shared Playlist", description: "Listen to music together with the artist" },
  { icon: "🎤", title: "Open Mic", description: "Request to perform for the group" },
  { icon: "🎮", title: "Mini Games", description: "Music trivia & challenges with prizes" },
  { icon: "📸", title: "Photo Booth", description: "Virtual photos with the artist" },
];

export const ConcertAfterparty = ({ onBack }: Props) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Luna Wave", message: "Hey everyone! Thanks for an amazing show tonight! 🎉", timestamp: new Date(), isArtist: true },
    { id: "2", user: "FanGirl99", message: "OMG that encore was INCREDIBLE!!!", timestamp: new Date(), isVIP: true },
    { id: "3", user: "MusicLover42", message: "Best concert I've ever seen 🔥", timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: newMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage("");

    // Broadcast via Supabase realtime
    supabase.channel("afterparty-" + activeRoom).send({
      type: "broadcast",
      event: "message",
      payload: msg,
    });
  };

  const joinRoom = (id: string) => {
    setActiveRoom(id);
    toast({ title: "Welcome to the Afterparty! 🎉", description: "You're now in the exclusive post-concert hangout" });

    const channel = supabase.channel("afterparty-" + id);
    channel.on("broadcast", { event: "message" }, ({ payload }) => {
      setMessages(prev => [...prev, payload as ChatMessage]);
    }).subscribe();
  };

  if (activeRoom) {
    const room = ACTIVE_AFTERPARTIES.find(r => r.id === activeRoom)!;
    return (
      <>
        <FloatingHowItWorks title="How Concert Afterparty works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveRoom(null)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h2 className="text-lg font-black flex items-center gap-2">
              {room.emoji} {room.artist}'s Afterparty
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500/20 text-red-400 border-0 text-xs animate-pulse">● LIVE</Badge>
              <span className="text-xs text-muted-foreground">{room.attendees} fans</span>
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PARTY_FEATURES.map((f, i) => (
            <Button key={i} variant="outline" size="sm" className="flex-shrink-0 text-xs gap-1" onClick={() => toast({ title: `${f.icon} ${f.title}`, description: f.description })}>
              {f.icon} {f.title}
            </Button>
          ))}
        </div>

        {/* Chat */}
        <Card className="border-primary/20">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.user === "You" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      msg.user === "You"
                        ? "bg-primary text-primary-foreground"
                        : msg.isArtist
                          ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30"
                          : "bg-muted"
                    }`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs font-bold">{msg.user}</span>
                        {msg.isArtist && <Crown className="w-3 h-3 text-amber-400" />}
                        {msg.isVIP && <Badge className="text-[8px] px-1 py-0 bg-amber-500/20 text-amber-400 border-0">VIP</Badge>}
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input
                placeholder="Say something..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Concert Afterparty
          </h2>
          <p className="text-sm text-muted-foreground">Exclusive post-concert hangout rooms</p>
        </div>
      </div>

      {/* Active Rooms */}
      <div className="space-y-3">
        <h3 className="font-bold flex items-center gap-2"><PartyPopper className="w-4 h-4 text-primary" /> Active Afterparties</h3>
        {ACTIVE_AFTERPARTIES.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer" onClick={() => joinRoom(room.id)}>
              <div className={`h-2 bg-gradient-to-r ${room.gradient}`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{room.emoji}</span>
                    <div>
                      <h4 className="font-bold">{room.title}</h4>
                      <p className="text-sm text-muted-foreground">by {room.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={room.status === "live" ? "bg-red-500/20 text-red-400 border-0 animate-pulse" : "bg-amber-500/20 text-amber-400 border-0"}>
                      {room.status === "live" ? "● LIVE" : "Starting Soon"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                      <Users className="w-3 h-3" /> {room.attendees} fans
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Afterparty Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {PARTY_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-bold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
