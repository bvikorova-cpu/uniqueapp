import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarDays, Clock, Video, MapPin, Plus, Check, X } from "lucide-react";

interface Session {
  id: string;
  title: string;
  partner: string;
  partnerEmoji: string;
  date: Date;
  time: string;
  duration: string;
  type: "video" | "in-person";
  status: "upcoming" | "completed" | "cancelled";
  skill: string;
}

const today = new Date();
const MOCK_SESSIONS: Session[] = [
  { id: "1", title: "Guitar Lesson #5", partner: "Tomáš M.", partnerEmoji: "🇸🇰", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), time: "14:00", duration: "60 min", type: "video", status: "upcoming", skill: "Guitar" },
  { id: "2", title: "Japanese Conversation", partner: "Yuki T.", partnerEmoji: "🇯🇵", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), time: "10:00", duration: "45 min", type: "video", status: "upcoming", skill: "Japanese" },
  { id: "3", title: "Photography Walk", partner: "Sarah K.", partnerEmoji: "🇬🇧", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4), time: "16:00", duration: "90 min", type: "in-person", status: "upcoming", skill: "Photography" },
  { id: "4", title: "Python Basics", partner: "James L.", partnerEmoji: "🇺🇸", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), time: "18:00", duration: "60 min", type: "video", status: "completed", skill: "Programming" },
  { id: "5", title: "Spanish Practice", partner: "Carlos R.", partnerEmoji: "🇲🇽", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3), time: "11:00", duration: "30 min", type: "video", status: "completed", skill: "Spanish" },
  { id: "6", title: "Design Review", partner: "Aisha B.", partnerEmoji: "🇳🇬", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5), time: "15:00", duration: "45 min", type: "video", status: "cancelled", skill: "Design" },
];

interface SessionSchedulerProps {
  onBack: () => void;
}

export const SessionScheduler = ({ onBack }: SessionSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const sessionDates = MOCK_SESSIONS.filter(s => s.status === "upcoming").map(s => s.date);

  const filteredSessions = MOCK_SESSIONS.filter(s => {
    if (filter === "upcoming") return s.status === "upcoming";
    if (filter === "completed") return s.status === "completed";
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const upcomingCount = MOCK_SESSIONS.filter(s => s.status === "upcoming").length;
  const completedCount = MOCK_SESSIONS.filter(s => s.status === "completed").length;
  const totalHours = MOCK_SESSIONS.filter(s => s.status === "completed").reduce((sum, s) => sum + parseInt(s.duration), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> Session Scheduler
        </h2>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Upcoming", value: upcomingCount.toString(), emoji: "📅" },
          { label: "Completed", value: completedCount.toString(), emoji: "✅" },
          { label: "Hours Learned", value: totalHours.toString(), emoji: "⏱️" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border/50">
              <span className="text-xl block mb-1">{stat.emoji}</span>
              <div className="text-xl font-black">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/50">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ session: sessionDates }}
            modifiersClassNames={{ session: "bg-primary/20 text-primary font-bold" }}
            className="mx-auto"
          />
          <div className="flex items-center gap-2 mt-3 justify-center text-[10px] text-muted-foreground">
            <div className="w-3 h-3 rounded bg-primary/20" />
            <span>Sessions scheduled</span>
          </div>
        </Card>

        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            {(["all", "upcoming", "completed"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize">
                {f}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredSessions.map((session, i) => (
              <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all ${
                  session.status === "cancelled" ? "opacity-60" : ""
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {session.partnerEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm">{session.title}</h3>
                          <p className="text-xs text-muted-foreground">with {session.partner}</p>
                        </div>
                        <Badge
                          variant={session.status === "upcoming" ? "default" : session.status === "completed" ? "secondary" : "outline"}
                          className="text-[10px] flex-shrink-0"
                        >
                          {session.status === "upcoming" && <Clock className="w-2.5 h-2.5 mr-1" />}
                          {session.status === "completed" && <Check className="w-2.5 h-2.5 mr-1" />}
                          {session.status === "cancelled" && <X className="w-2.5 h-2.5 mr-1" />}
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {session.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {session.time} ({session.duration})
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          {session.type === "video" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {session.type === "video" ? "Video Call" : "In-Person"}
                        </span>
                        <Badge variant="outline" className="text-[9px]">{session.skill}</Badge>
                      </div>
                    </div>
                    {session.status === "upcoming" && (
                      <Button size="sm" variant="default" className="text-xs flex-shrink-0 gap-1">
                        <Video className="w-3 h-3" /> Join
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
