import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Calendar, Clock, Users, Radio, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string;
  room_url: string | null;
  max_participants: number | null;
  instructor_id: string;
  instructor_name?: string;
}

interface Props { onBack: () => void; }

export function LiveSessionsView({ onBack }: Props) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("live_lessons")
        .select("id,title,description,scheduled_at,duration_minutes,status,room_url,max_participants,instructor_id")
        .order("scheduled_at", { ascending: false })
        .limit(30);
      const rows = (data ?? []) as LiveSession[];
      if (rows.length) {
        const ids = [...new Set(rows.map(r => r.instructor_id))];
        const { data: profs } = await (supabase as any).from("profiles_public").select("id,username,full_name").in("id", ids);
        const pMap = new Map<string, any>((profs ?? []).map((p: any) => [p.id, p.username || p.full_name || "Instructor"]));
        rows.forEach(r => { r.instructor_name = pMap.get(r.instructor_id) || "Instructor"; });
      }
      setSessions(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Live Sessions View - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Sessions View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Sessions View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Live Sessions</h2>
            <p className="text-sm text-muted-foreground">Live classes scheduled by instructors</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No live sessions scheduled yet.</Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const isLive = session.status === "live";
            const isCompleted = session.status === "completed";
            const when = new Date(session.scheduled_at);
            return (
              <Card key={session.id} className={`p-4 hover:shadow-lg transition-all ${isLive ? "border-red-500/30 bg-red-500/5" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{session.title}</h3>
                      {isLive && <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px]"><Radio className="w-3 h-3 mr-1" />LIVE NOW</Badge>}
                      {session.status === "upcoming" && <Badge variant="secondary">Upcoming</Badge>}
                      {isCompleted && <Badge variant="outline" className="text-muted-foreground"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">by {session.instructor_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(when, "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(when, "HH:mm")}</span>
                      {session.max_participants && <span className="flex items-center gap-1"><Users className="w-3 h-3" />Up to {session.max_participants}</span>}
                    </div>
                  </div>
                  {isLive && session.room_url && (
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 shadow-lg" asChild>
                      <a href={session.room_url} target="_blank" rel="noopener noreferrer">Join Live</a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
