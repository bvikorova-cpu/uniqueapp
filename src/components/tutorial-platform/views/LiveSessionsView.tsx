import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Calendar, Clock, Users, Plus, Radio, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const mockSessions = [
  { id: 1, title: "React Hooks Deep Dive", instructor: "Sarah Chen", date: "Apr 8, 2026", time: "14:00 CET", attendees: 45, status: "upcoming", live: false },
  { id: 2, title: "Python Data Viz Workshop", instructor: "Emily Davis", date: "Apr 10, 2026", time: "16:00 CET", attendees: 32, status: "upcoming", live: false },
  { id: 3, title: "UX Portfolio Review", instructor: "Alex Kim", date: "Apr 12, 2026", time: "10:00 CET", attendees: 28, status: "upcoming", live: false },
  { id: 4, title: "Live Coding: Build a REST API", instructor: "Dr. Alan Turing Jr.", date: "Today", time: "Now", attendees: 156, status: "live", live: true },
  { id: 5, title: "JavaScript Q&A Session", instructor: "Dr. Alan Turing Jr.", date: "Apr 3, 2026", time: "15:00 CET", attendees: 89, status: "completed", live: false },
];

interface Props { onBack: () => void; }

export function LiveSessionsView({ onBack }: Props) {
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSchedule = () => {
    if (!title.trim() || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }
    const newSession = {
      id: Date.now(),
      title: title.trim(),
      instructor: "You",
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: `${time} CET`,
      attendees: 0,
      status: "upcoming",
      live: false,
    };
    setSessions([newSession, ...sessions]);
    setTitle(""); setDate(""); setTime("");
    setCreating(false);
    toast.success("Session scheduled!");
  };

  const handleRegister = (id: number) => {
    if (registered.has(id)) {
      toast.info("Already registered");
      return;
    }
    setRegistered(new Set([...registered, id]));
    setSessions(sessions.map(s => s.id === id ? { ...s, attendees: s.attendees + 1 } : s));
    toast.success("Registered for session!");
  };

  const handleJoinLive = (title: string) => {
    toast.success(`Joining: ${title}`);
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Live Sessions</h2>
            <p className="text-sm text-muted-foreground">Schedule & join live classes</p>
          </div>
        </div>
        <Button onClick={() => setCreating(!creating)} className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />Schedule Session
        </Button>
      </div>

      {creating && (
        <Card className="mb-6 border-rose-500/20">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Session title..." className="h-11" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" className="h-11" />
              <Input type="time" className="h-11" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600" onClick={() => toast.info("Schedule — coming soon")}><Calendar className="w-4 h-4 mr-2" />Schedule</Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {mockSessions.map(session => (
          <Card key={session.id} className={`p-4 hover:shadow-lg transition-all ${session.live ? "border-red-500/30 bg-red-500/5 animate-pulse-slow" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{session.title}</h3>
                  {session.live && (
                    <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px]">
                      <Radio className="w-3 h-3 mr-1" />LIVE NOW
                    </Badge>
                  )}
                  {session.status === "upcoming" && <Badge variant="secondary">Upcoming</Badge>}
                  {session.status === "completed" && <Badge variant="outline" className="text-muted-foreground"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">by {session.instructor}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.attendees} {session.live ? "watching" : "registered"}</span>
                </div>
              </div>
              {session.live && <Button size="sm" className="bg-red-500 hover:bg-red-600 shadow-lg" onClick={() => toast.info("Join Live — coming soon")}>Join Live</Button>}
              {session.status === "upcoming" && <Button size="sm" variant="outline" onClick={() => toast.info("Register — coming soon")}>Register</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}