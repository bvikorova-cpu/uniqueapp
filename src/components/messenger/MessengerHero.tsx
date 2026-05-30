import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Volume2, VolumeX, Play, Pause, Send, Zap, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import messengerVideo from "@/assets/messenger-hero.mp4.asset.json";

interface MessengerHeroProps {
  onOpenChat: () => void;
  stats: { totalMessages: number; activeChats: number; friendsOnline: number; aiCredits: number };
}

export const MessengerHero = ({ onOpenChat, stats }: MessengerHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } };
  const togglePlay = () => { if (videoRef.current) { if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); } };

  const statItems = [
    { icon: Send, label: "Messages Sent", value: stats.totalMessages.toLocaleString(), color: "text-cyan-400" },
    { icon: MessageCircle, label: "Active Chats", value: stats.activeChats.toLocaleString(), color: "text-blue-400" },
    { icon: Users, label: "Friends Online", value: stats.friendsOnline.toLocaleString(), color: "text-emerald-400" },
    { icon: Sparkles, label: "AI Credits", value: stats.aiCredits.toLocaleString(), color: "text-purple-400" },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={messengerVideo.url}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-10 min-h-[320px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/30"
                whileHover={{ rotate: -5, scale: 1.05 }}
              >
                <MessageCircle className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-black text-white"
                  style={{
                    WebkitTextStroke: "1.5px rgba(0,0,0,0.3)",
                    textShadow: "0 2px 20px rgba(0,200,255,0.3), 0 4px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  Messenger Hub
                </h1>
                <p className="text-white/80 text-sm font-medium">Real-time chat • Voice • AI-powered features</p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white/80 hover:text-white hover:bg-white/10">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white/80 hover:text-white hover:bg-white/10">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end justify-between gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto"
          >
            {statItems.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center"
              >
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-black text-white">{stat.value}</p>
                <p className="text-[10px] text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button
              onClick={onOpenChat}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 gap-2 shadow-xl shadow-cyan-500/25 active:scale-[0.97] font-bold"
              size="lg"
            >
              <Zap className="h-4 w-4" /> Open Chat
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
