import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Calendar, Clock, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockSessions = [
  { id: 1, title: "React Hooks Deep Dive", instructor: "Sarah Chen", date: "Apr 8, 2026", time: "14:00 CET", attendees: 45, status: "upcoming" },
  { id: 2, title: "Python Data Viz Workshop", instructor: "Emily Davis", date: "Apr 10, 2026", time: "16:00 CET", attendees: 32, status: "upcoming" },
  { id: 3, title: "UX Portfolio Review", instructor: "Alex Kim", date: "Apr 12, 2026", time: "10:00 CET", attendees: 28, status: "upcoming" },
  { id: 4, title: "JavaScript Q&A Session", instructor: "Dr. Alan Turing Jr.", date: "Apr 3, 2026", time: "15:00 CET", attendees: 89, status: "completed" },
];

interface Props { onBack: () => void; }

export function LiveSessionsView({ onBack }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><Video className="w-6 h-6 text-rose-500" />Live Sessions</h2>
        <Button onClick={() => setCreating(!creating)}><Plus className="w-4 h-4 mr-2" />Schedule Session</Button>
      </div>

      {creating && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Session title..." />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" />
              <Input type="time" />
            </div>
            <Button className="w-full"><Calendar className="w-4 h-4 mr-2" />Schedule Live Session</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {mockSessions.map(session => (
          <Card key={session.id} className="p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{session.title}</h3>
                  <Badge variant={session.status === "upcoming" ? "default" : "secondary"}>{session.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">by {session.instructor}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.attendees} registered</span>
                </div>
              </div>
              {session.status === "upcoming" && <Button size="sm">Join</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
