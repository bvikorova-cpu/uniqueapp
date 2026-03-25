import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Eye, MessageCircle, Heart, X, Volume2, VolumeX, Maximize2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveStream {
  id: string;
  title: string;
  streamer: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  viewers: number;
  thumbnail: string;
  category: string;
  isLive: boolean;
}

const mockStreams: LiveStream[] = [
  {
    id: "1",
    title: "🎨 Live Art Session - Digital Painting",
    streamer: { name: "ArtistJana", avatar: undefined, verified: true },
    viewers: 342,
    thumbnail: "",
    category: "Art",
    isLive: true,
  },
  {
    id: "2",
    title: "🎸 Acoustic Evening Vibes",
    streamer: { name: "MusicMark", avatar: undefined },
    viewers: 128,
    thumbnail: "",
    category: "Music",
    isLive: true,
  },
  {
    id: "3",
    title: "💬 Q&A - Ask Me Anything!",
    streamer: { name: "TechSara", avatar: undefined, verified: true },
    viewers: 567,
    thumbnail: "",
    category: "Talk",
    isLive: true,
  },
];

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  isSuper?: boolean;
}

export function LiveStreamWidget() {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [muted, setMuted] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Alex", text: "This is amazing! 🔥" },
    { id: "2", user: "Maria", text: "Love the vibes ❤️" },
    { id: "3", user: "Peter", text: "Can you play something chill?", isSuper: true },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  const sendReaction = (emoji: string) => {
    const id = Date.now();
    const x = Math.random() * 80 + 10;
    setReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2000);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: String(Date.now()), user: "You", text: chatInput },
    ]);
    setChatInput("");
  };

  return (
    <div className="space-y-3">
      {/* Stream Cards */}
      <div className="flex items-center gap-2 mb-1">
        <div className="relative">
          <Radio className="h-5 w-5 text-destructive" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        </div>
        <h3 className="font-bold text-sm">Live Now</h3>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {mockStreams.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {mockStreams.map((stream) => (
          <motion.div
            key={stream.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedStream(stream)}
            className="glass-card rounded-xl p-3 cursor-pointer hover:bg-accent/20 transition-all group"
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail placeholder */}
              <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center relative overflow-hidden shrink-0">
                <Radio className="h-5 w-5 text-primary/60" />
                <div className="absolute top-1 left-1">
                  <Badge className="bg-destructive text-[8px] px-1 py-0 h-3.5 font-bold animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/60 rounded px-1">
                  <Eye className="h-2.5 w-2.5 text-white" />
                  <span className="text-[9px] text-white font-medium">{stream.viewers}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{stream.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={stream.streamer.avatar} />
                    <AvatarFallback className="text-[7px] bg-primary/20">
                      {stream.streamer.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground">{stream.streamer.name}</span>
                  {stream.streamer.verified && (
                    <span className="text-[10px]">✓</span>
                  )}
                </div>
                <Badge variant="outline" className="text-[9px] px-1 py-0 mt-1 h-4">
                  {stream.category}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Stream Viewer */}
      <AnimatePresence>
        {selectedStream && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          >
            {/* Stream header */}
            <div className="flex items-center justify-between p-3 bg-black/50">
              <div className="flex items-center gap-2">
                <Badge className="bg-destructive text-xs animate-pulse">● LIVE</Badge>
                <span className="text-white font-semibold text-sm">{selectedStream.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-white/70">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{selectedStream.viewers}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMuted(!muted)} className="text-white">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedStream(null)} className="text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Video area */}
            <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="text-center space-y-3">
                <Radio className="h-16 w-16 text-primary/40 mx-auto" />
                <p className="text-white/50 text-sm">Live stream preview</p>
              </div>

              {/* Floating reactions */}
              {reactions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -120 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute bottom-20 text-2xl pointer-events-none"
                  style={{ left: `${r.x}%` }}
                >
                  {r.emoji}
                </motion.div>
              ))}

              {/* Quick reactions */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {["❤️", "🔥", "👏", "😍", "🎉"].map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.4 }}
                    onClick={() => sendReaction(emoji)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chat overlay */}
            <div className="h-48 bg-black/70 flex flex-col">
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "text-sm",
                    msg.isSuper && "bg-primary/20 rounded-lg px-2 py-1"
                  )}>
                    <span className={cn(
                      "font-semibold mr-1.5",
                      msg.user === "You" ? "text-primary" : "text-white/80"
                    )}>
                      {msg.user}
                    </span>
                    <span className="text-white/70">{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-2 border-t border-white/10">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Say something..."
                  className="bg-white/10 border-0 text-white placeholder:text-white/30 text-sm rounded-xl"
                />
                <Button size="sm" onClick={sendChat} className="rounded-xl shrink-0">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
