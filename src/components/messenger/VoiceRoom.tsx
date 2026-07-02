import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mic, MicOff, Headphones, Plus, Users, Volume2, Radio, Crown, Hand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface VoiceRoomProps {
  onBack: () => void;
  userId: string;
}

interface Room {
  id: string;
  name: string;
  topic: string;
  participants: { id: string; name: string; isSpeaking: boolean; isHost: boolean }[];
  isLive: boolean;
}

const mockRooms: Room[] = [
  {
    id: "1", name: "Chill Lounge", topic: "Just hanging out & chatting", isLive: true,
    participants: [
      { id: "1", name: "Alex", isSpeaking: true, isHost: true },
      { id: "2", name: "Sam", isSpeaking: false, isHost: false },
      { id: "3", name: "Jordan", isSpeaking: true, isHost: false },
    ],
  },
  {
    id: "2", name: "Music Corner", topic: "Sharing new tracks", isLive: true,
    participants: [
      { id: "4", name: "Riley", isSpeaking: false, isHost: true },
      { id: "5", name: "Taylor", isSpeaking: true, isHost: false },
    ],
  },
  {
    id: "3", name: "Gaming Talk", topic: "Latest game releases", isLive: false,
    participants: [
      { id: "6", name: "Morgan", isSpeaking: false, isHost: true },
    ],
  },
];

export const VoiceRoom = ({ onBack, userId }: VoiceRoomProps) => {
  const [rooms, setRooms] = useState(mockRooms);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const joinRoom = (room: Room) => {
    setActiveRoom(room);
    setIsMuted(true);
    toast({ title: "Joined Room", description: `You joined "${room.name}"` });
  };

  const leaveRoom = () => {
    setActiveRoom(null);
    setIsMuted(true);
    setHandRaised(false);
    toast({ title: "Left Room", description: "You left the voice room" });
  };

  const createRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
      id: Date.now().toString(),
      name: newRoomName,
      topic: "New conversation",
      isLive: true,
      participants: [{ id: userId, name: "You", isSpeaking: false, isHost: true }],
    };
    setRooms([newRoom, ...rooms]);
    setActiveRoom(newRoom);
    setNewRoomName("");
    setShowCreate(false);
    toast({ title: "Room Created!", description: `"${newRoomName}" is now live` });
  };

  if (activeRoom) {
    return (
      <div className="space-y-6">
      <FloatingHowItWorks
        title={"Voice Room"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={leaveRoom}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h2 className="text-xl font-black">{activeRoom.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Radio className="h-3 w-3 text-red-500 animate-pulse" /> {activeRoom.topic}
            </p>
          </div>
        </div>

        {/* Speakers Grid */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-muted-foreground">Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {activeRoom.participants.map((p) => (
                <motion.div
                  key={p.id}
                  animate={p.isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`relative rounded-full p-0.5 ${p.isSpeaking ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-border"}`}>
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarFallback className="bg-primary/20 font-black text-lg">{p.name[0]}</AvatarFallback>
                    </Avatar>
                    {p.isHost && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {p.isSpeaking && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-cyan-500 rounded-full p-1">
                        <Volume2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold">{p.name}</span>
                </motion.div>
              ))}
              {/* You */}
              <motion.div className="flex flex-col items-center gap-2">
                <div className={`relative rounded-full p-0.5 ${!isMuted ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-border"}`}>
                  <Avatar className="h-16 w-16 border-2 border-background">
                    <AvatarFallback className="bg-emerald-500/20 font-black text-lg">Y</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs font-bold">You</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant={isMuted ? "outline" : "default"}
            onClick={() => setIsMuted(!isMuted)}
            className={`rounded-full w-14 h-14 ${!isMuted ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" : ""}`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button
            size="lg"
            variant={handRaised ? "default" : "outline"}
            onClick={() => { setHandRaised(!handRaised); toast({ title: handRaised ? "Hand Lowered" : "Hand Raised" }); }}
            className={`rounded-full w-14 h-14 ${handRaised ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : ""}`}
          >
            <Hand className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={leaveRoom}
            className="rounded-full w-14 h-14"
          >
            <Headphones className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Voice Rooms</h2>
            <p className="text-sm text-muted-foreground">Drop-in audio conversations</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Plus className="h-4 w-4" /> Create Room
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30">
              <CardContent className="p-4 flex gap-3">
                <Input placeholder="Room name..." value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
                <Button onClick={createRoom} disabled={!newRoomName.trim()}>Create</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <Card
              className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => joinRoom(room)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black flex items-center gap-2">
                      {room.name}
                      {room.isLive && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">LIVE</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">{room.topic}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {room.participants.length}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {room.participants.slice(0, 5).map((p) => (
                    <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-[10px] font-bold">{p.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {room.participants.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{room.participants.length - 5}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
