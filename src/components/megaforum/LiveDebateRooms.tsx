import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Plus, Send, Timer, Users, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LiveDebateRoomsProps {
  onBack: () => void;
}

export const LiveDebateRooms = ({ onBack }: LiveDebateRoomsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [sideA, setSideA] = useState("For");
  const [sideB, setSideB] = useState("Against");
  const [message, setMessage] = useState("");
  const [mySide, setMySide] = useState<string | null>(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ["debate-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_debate_rooms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["debate-messages", activeRoom],
    queryFn: async () => {
      if (!activeRoom) return [];
      const { data, error } = await supabase
        .from("forum_debate_messages")
        .select("*")
        .eq("room_id", activeRoom)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!activeRoom,
    refetchInterval: activeRoom ? 3000 : false,
  });

  const { data: myVote } = useQuery({
    queryKey: ["debate-my-vote", activeRoom],
    queryFn: async () => {
      if (!activeRoom) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("forum_debate_votes")
        .select("*")
        .eq("room_id", activeRoom)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!activeRoom,
  });

  const { data: voteCounts } = useQuery({
    queryKey: ["debate-vote-counts", activeRoom],
    queryFn: async () => {
      if (!activeRoom) return { a: 0, b: 0 };
      const { data } = await supabase.from("forum_debate_votes").select("side").eq("room_id", activeRoom);
      const room = rooms.find((r: any) => r.id === activeRoom);
      const a = data?.filter(v => v.side === (room?.side_a || "For")).length || 0;
      const b = data?.filter(v => v.side === (room?.side_b || "Against")).length || 0;
      return { a, b };
    },
    enabled: !!activeRoom,
    refetchInterval: activeRoom ? 5000 : false,
  });

  const createRoom = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { error } = await supabase.from("forum_debate_rooms").insert({
        creator_id: user.id,
        topic,
        description,
        side_a: sideA,
        side_b: sideB,
        duration_minutes: 30,
        ends_at: new Date(Date.now() + 30 * 60000).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debate-rooms"] });
      setShowCreate(false);
      setTopic("");
      setDescription("");
      toast({ title: "Debate room created!" });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      if (!mySide) throw new Error("Pick a side first");
      const { error } = await supabase.from("forum_debate_messages").insert({
        room_id: activeRoom!,
        user_id: user.id,
        content: message,
        side: mySide,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debate-messages"] });
      setMessage("");
    },
  });

  const castVote = useMutation({
    mutationFn: async (side: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { error } = await supabase.from("forum_debate_votes").insert({
        room_id: activeRoom!,
        user_id: user.id,
        side,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debate-my-vote"] });
      queryClient.invalidateQueries({ queryKey: ["debate-vote-counts"] });
      toast({ title: "Vote cast!" });
    },
  });

  const currentRoom = rooms.find((r: any) => r.id === activeRoom);
  const totalVotes = (voteCounts?.a || 0) + (voteCounts?.b || 0);
  const pctA = totalVotes > 0 ? Math.round((voteCounts!.a / totalVotes) * 100) : 50;

  if (activeRoom && currentRoom) {
    return (
      <div className="space-y-4">
      <FloatingHowItWorks
        title={"Live Debate Rooms"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <Button variant="ghost" onClick={() => { setActiveRoom(null); setMySide(null); }} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Rooms
        </Button>

        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentRoom.topic}</CardTitle>
              <Badge variant={currentRoom.status === "active" ? "default" : "secondary"}>
                {currentRoom.status === "active" ? "🔴 Live" : "Ended"}
              </Badge>
            </div>
            {currentRoom.description && <p className="text-sm text-muted-foreground">{currentRoom.description}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vote Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-emerald-400">{currentRoom.side_a} ({pctA}%)</span>
                <span className="text-rose-400">{currentRoom.side_b} ({100 - pctA}%)</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex bg-accent/30">
                <div className="bg-emerald-500 transition-all" style={{ width: `${pctA}%` }} />
                <div className="bg-rose-500 transition-all" style={{ width: `${100 - pctA}%` }} />
              </div>
              <p className="text-xs text-center text-muted-foreground">{totalVotes} total votes</p>
            </div>

            {!myVote && (
              <div className="flex gap-2">
                <Button onClick={() => castVote.mutate(currentRoom.side_a)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Vote {currentRoom.side_a}
                </Button>
                <Button onClick={() => castVote.mutate(currentRoom.side_b)} className="flex-1 bg-rose-600 hover:bg-rose-700">
                  Vote {currentRoom.side_b}
                </Button>
              </div>
            )}

            {/* Pick side to chat */}
            {!mySide && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMySide(currentRoom.side_a)} className="flex-1 border-emerald-500/50">
                  Argue {currentRoom.side_a}
                </Button>
                <Button variant="outline" onClick={() => setMySide(currentRoom.side_b)} className="flex-1 border-rose-500/50">
                  Argue {currentRoom.side_b}
                </Button>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="h-[300px] border rounded-lg p-3">
              <div className="space-y-3">
                {messages.map((msg: any) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.side === currentRoom.side_a ? "" : "flex-row-reverse"}`}
                  >
                    <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      msg.side === currentRoom.side_a ? "bg-emerald-500/20 text-emerald-100" : "bg-rose-500/20 text-rose-100"
                    }`}>
                      <p className="text-[10px] font-bold mb-1 opacity-60">{msg.side}</p>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-10">No arguments yet. Start the debate!</p>
                )}
              </div>
            </ScrollArea>

            {mySide && (
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Argue ${mySide}...`}
                  onKeyDown={(e) => e.key === "Enter" && message.trim() && sendMessage.mutate()}
                />
                <Button size="icon" onClick={() => sendMessage.mutate()} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Debate
        </Button>
      </div>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        ⚔️ Live Debate Rooms
      </h2>

      {showCreate && (
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Debate topic..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Side A (e.g. For)" value={sideA} onChange={(e) => setSideA(e.target.value)} />
              <Input placeholder="Side B (e.g. Against)" value={sideB} onChange={(e) => setSideB(e.target.value)} />
            </div>
            <Button onClick={() => createRoom.mutate()} disabled={!topic.trim() || createRoom.isPending} className="w-full">
              {createRoom.isPending ? "Creating..." : "Start Debate"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {rooms.map((room: any, i: number) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="bg-card/80 backdrop-blur-xl hover:shadow-lg transition-all cursor-pointer border-primary/10"
              onClick={() => setActiveRoom(room.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{room.topic}</h3>
                  <Badge variant={room.status === "active" ? "default" : "secondary"}>
                    {room.status === "active" ? "🔴 Live" : "Ended"}
                  </Badge>
                </div>
                {room.description && <p className="text-sm text-muted-foreground mb-3">{room.description}</p>}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="text-emerald-400 font-bold">{room.side_a}</span>
                  <span>vs</span>
                  <span className="text-rose-400 font-bold">{room.side_b}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <Users className="h-3 w-3" /> {room.participants_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {rooms.length === 0 && (
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardContent className="text-center py-10 text-muted-foreground">
              No active debates. Start one!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
