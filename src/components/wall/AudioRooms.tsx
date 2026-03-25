import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Radio, Users, Volume2, Hand, X, Plus, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AudioRoom {
  id: string;
  name: string;
  topic: string;
  speakers: { id: string; name: string; avatar?: string; isMuted: boolean; isSpeaking: boolean }[];
  listeners: number;
  isLive: boolean;
}

const MOCK_ROOMS: AudioRoom[] = [
  {
    id: "1",
    name: "Late Night Talks",
    topic: "Life, Universe & Everything",
    speakers: [
      { id: "1", name: "Alex", isMuted: false, isSpeaking: true },
      { id: "2", name: "Maya", isMuted: true, isSpeaking: false },
      { id: "3", name: "Jordan", isMuted: false, isSpeaking: false },
    ],
    listeners: 47,
    isLive: true,
  },
  {
    id: "2",
    name: "Music Corner",
    topic: "Underground Hip-Hop Discussion",
    speakers: [
      { id: "4", name: "Beats", isMuted: false, isSpeaking: true },
      { id: "5", name: "Vinyl", isMuted: false, isSpeaking: false },
    ],
    listeners: 23,
    isLive: true,
  },
  {
    id: "3",
    name: "Tech & Startups",
    topic: "AI Revolution 2026",
    speakers: [
      { id: "6", name: "Dev", isMuted: false, isSpeaking: false },
    ],
    listeners: 89,
    isLive: true,
  },
];

export const AudioRooms = () => {
  const [rooms] = useState<AudioRoom[]>(MOCK_ROOMS);
  const [activeRoom, setActiveRoom] = useState<AudioRoom | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  return (
    <>
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Audio Rooms</h3>
              <span className="text-xs text-muted-foreground">{rooms.length} live now</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1 rounded-xl" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create
          </Button>
        </div>

        <div className="space-y-3">
          {rooms.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveRoom(room)}
              className="w-full text-left p-3 rounded-xl bg-accent/20 hover:bg-accent/40 backdrop-blur-sm border border-white/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{room.name}</h4>
                    {room.isLive && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1"
                      >
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span className="text-[10px] font-bold text-destructive uppercase">Live</span>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{room.topic}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {room.speakers.slice(0, 4).map((speaker) => (
                    <div key={speaker.id} className="relative">
                      <Avatar className={`h-7 w-7 border-2 border-background ${speaker.isSpeaking ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}>
                        <AvatarImage src={speaker.avatar} />
                        <AvatarFallback className="text-[10px] bg-accent">{speaker.name[0]}</AvatarFallback>
                      </Avatar>
                      {speaker.isSpeaking && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border border-background"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{room.listeners}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active Room Panel */}
      <AnimatePresence>
        {activeRoom && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-lg mx-auto rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">{activeRoom.name}</h3>
                  <p className="text-xs text-muted-foreground">{activeRoom.topic}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setActiveRoom(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Speakers grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {activeRoom.speakers.map((speaker) => (
                  <div key={speaker.id} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <Avatar className={`h-14 w-14 ${speaker.isSpeaking ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                        <AvatarImage src={speaker.avatar} />
                        <AvatarFallback className="bg-accent">{speaker.name[0]}</AvatarFallback>
                      </Avatar>
                      {speaker.isMuted && (
                        <div className="absolute bottom-0 right-0 bg-destructive rounded-full p-0.5">
                          <MicOff className="w-2.5 h-2.5 text-destructive-foreground" />
                        </div>
                      )}
                      {speaker.isSpeaking && (
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border-2 border-primary"
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-medium truncate w-full text-center">{speaker.name}</span>
                    {speaker.id === "1" && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        <Crown className="w-2.5 h-2.5 mr-0.5" />Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Users className="w-3.5 h-3.5" />
                <span>{activeRoom.listeners} listeners</span>
                <Volume2 className="w-3.5 h-3.5 ml-2" />
                <span>Live</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isMuted ? 'bg-accent' : 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setHandRaised(!handRaised)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    handRaised ? 'bg-amber-500 text-white' : 'bg-accent'
                  }`}
                >
                  <Hand className="w-5 h-5" />
                </motion.button>

                <Button
                  variant="destructive"
                  className="rounded-full px-6"
                  onClick={() => setActiveRoom(null)}
                >
                  Leave
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              Create Audio Room
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <Input placeholder="Topic / Description..." />
            <Button className="w-full" onClick={() => setCreateOpen(false)}>
              Go Live 🎙️
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
