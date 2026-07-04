import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Clock, Send, Trash2, Calendar, MessageCircle, Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface MessageSchedulerProps {
  onBack: () => void;
  userId: string;
}

interface ScheduledMessage {
  id: string;
  recipientName: string;
  recipientAvatar?: string;
  content: string;
  scheduledFor: Date;
  status: "pending" | "sent" | "failed";
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const MessageScheduler = ({ onBack, userId }: MessageSchedulerProps) => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([
    { id: "1", recipientName: "Demo User", content: "Happy Birthday! 🎂🎉", scheduledFor: new Date(Date.now() + 86400000), status: "pending" },
    { id: "2", recipientName: "Team Group", content: "Reminder: meeting at 3pm today", scheduledFor: new Date(Date.now() + 3600000), status: "pending" },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchFriends = async () => {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      const friendIds = friendships?.map(f => f.user_id === userId ? f.friend_id : f.user_id) || [];
      if (friendIds.length === 0) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", friendIds);

      setFriends(profiles || []);
    };
    fetchFriends();
  }, [userId]);

  const createScheduled = () => {
    if (!selectedFriend || !messageContent.trim() || !scheduleDate || !scheduleTime) {
      toast({ title: "Missing Fields", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledFor <= new Date()) {
      toast({ title: "Invalid Time", description: "Schedule time must be in the future", variant: "destructive" });
      return;
    }

    const newMsg: ScheduledMessage = {
      id: Date.now().toString(),
      recipientName: selectedFriend.full_name || "User",
      recipientAvatar: selectedFriend.avatar_url || undefined,
      content: messageContent,
      scheduledFor,
      status: "pending",
    };

    setScheduledMessages(prev => [newMsg, ...prev]);
    setShowCreate(false);
    setSelectedFriend(null);
    setMessageContent("");
    setScheduleDate("");
    setScheduleTime("");
    toast({ title: "Message Scheduled!", description: `Will be sent on ${scheduledFor.toLocaleString()}` });
  };

  const deleteScheduled = (id: string) => {
    setScheduledMessages(prev => prev.filter(m => m.id !== id));
    toast({ title: "Deleted", description: "Scheduled message removed" });
  };

  const formatTimeLeft = (date: Date) => {
    const diff = date.getTime() - Date.now();
    if (diff < 0) return "Overdue";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Message Scheduler</h2>
            <p className="text-sm text-muted-foreground">Schedule messages to be sent later</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Plus className="h-4 w-4" /> Schedule
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-black">New Scheduled Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Friend selector */}
                <div>
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">Recipient</label>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {friends.map(f => (
                      <div
                        key={f.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedFriend?.id === f.id ? "bg-primary/20 border border-primary/30" : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedFriend(f)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={f.avatar_url || undefined} />
                          <AvatarFallback>{f.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{f.full_name}</span>
                        {selectedFriend?.id === f.id && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                      </div>
                    ))}
                    {friends.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Add friends to schedule messages</p>
                    )}
                  </ScrollArea>
                </div>

                <Input
                  placeholder="Type your message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-1 block">Date</label>
                    <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-1 block">Time</label>
                    <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createScheduled} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white gap-2">
                    <Clock className="h-4 w-4" /> Schedule Message
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scheduled Messages List */}
      <div className="space-y-3">
        {scheduledMessages.length === 0 ? (
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-black text-lg mb-1">No Scheduled Messages</h3>
              <p className="text-sm text-muted-foreground">Schedule messages to be sent automatically</p>
            </CardContent>
          </Card>
        ) : (
          scheduledMessages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mt-0.5">
                        <MessageCircle className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">To: {msg.recipientName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            msg.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                            msg.status === "sent" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {msg.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{msg.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{msg.scheduledFor.toLocaleString()}</span>
                          <span className="text-primary font-bold">({formatTimeLeft(msg.scheduledFor)})</span>
                        </div>
                      </div>
                    </div>
                    {msg.status === "pending" && (
                      <Button variant="ghost" size="icon" onClick={() => deleteScheduled(msg.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
