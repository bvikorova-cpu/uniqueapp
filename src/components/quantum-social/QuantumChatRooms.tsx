import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Plus, MessageSquare, Users, Atom, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Room {
  id: string;
  name: string;
  description: string;
  room_type: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_observed: boolean;
  observed_by_count: number;
  created_at: string;
}

export function QuantumChatRooms({ onBack }: { onBack: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      const channel = supabase
        .channel(`room-${activeRoom.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quantum_chat_messages', filter: `room_id=eq.${activeRoom.id}` }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    const { data } = await supabase.from("quantum_chat_rooms").select("*").eq("is_active", true).order("created_at", { ascending: false });
    setRooms(data || []);
    setLoading(false);
  };

  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase.from("quantum_chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).limit(100);
    setMessages(data || []);
  };

  const createRoom = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!newRoomName.trim()) return;

    const { error } = await supabase.from("quantum_chat_rooms").insert([{
      name: newRoomName,
      description: "A quantum superposition chat room",
      creator_id: user.id,
    }]);

    if (error) {
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
    } else {
      toast({ title: "Room Created!", description: "Your quantum chat room is ready" });
      setNewRoomName("");
      setShowCreate(false);
      fetchRooms();
    }
  };

  const sendMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !activeRoom || !newMessage.trim()) return;

    const { error } = await supabase.from("quantum_chat_messages").insert([{
      room_id: activeRoom.id,
      sender_id: user.id,
      content: newMessage,
    }]);

    if (!error) setNewMessage("");
  };

  const observeMessage = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.is_observed) return;

    await supabase.from("quantum_chat_messages").update({
      is_observed: true,
      observed_by_count: (msg.observed_by_count || 0) + 1,
    }).eq("id", messageId);

    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_observed: true, observed_by_count: (m.observed_by_count || 0) + 1 } : m));
  };

  if (activeRoom) {
    return (
      <>
        <FloatingHowItWorks
          title='Quantum Chat Rooms'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Chat Rooms panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveRoom(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Atom className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              {activeRoom.name}
            </h2>
            <p className="text-xs text-muted-foreground">Messages exist in superposition until observed</p>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No messages yet. Start the quantum conversation!</p>
          )}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${msg.is_observed ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-violet-500/30 bg-violet-500/5 cursor-pointer hover:bg-violet-500/10'}`}
                onClick={() => !msg.is_observed && observeMessage(msg.id)}
              >
                {msg.is_observed ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <p className="text-sm text-violet-400 italic flex items-center gap-2">
                    <Atom className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                    Message in superposition — click to observe
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  {msg.is_observed && (
                    <Badge variant="outline" className="text-[10px] py-0">
                      <Eye className="h-2.5 w-2.5 mr-1" />
                      {msg.observed_by_count} observed
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type a quantum message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="border-cyan-500/20 bg-background/50"
          />
          <Button onClick={sendMessage} className="bg-cyan-600 hover:bg-cyan-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Quantum Chat Rooms</h2>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} variant="outline" className="border-cyan-500/30">
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
          <Input placeholder="Room name..." value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} className="border-cyan-500/20" />
          <Button onClick={createRoom} className="bg-cyan-600 hover:bg-cyan-700 w-full">Create Quantum Room</Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-2">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-muted-foreground col-span-2">No rooms yet. Create the first one!</p>
        ) : (
          rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveRoom(room)}
              className="cursor-pointer rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 p-4 hover:border-cyan-400/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <MessageSquare className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="text-xs text-muted-foreground">{room.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-[10px]">
                  <Users className="h-2.5 w-2.5 mr-1" />
                  Max {room.max_participants}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">{room.room_type}</Badge>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
