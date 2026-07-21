import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, Brain, TrendingUp, Eye, BarChart3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Replay {
  id: string;
  roomName: string;
  completedAt: string;
  duration: string;
  score: number;
  puzzlesSolved: number;
  totalPuzzles: number;
  hintsUsed: number;
  avgSolveTime: string;
}

function fmtSec(sec: number | null | undefined): string {
  if (!sec || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RoomReplayView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Replay | null>(null);

  const { data: replays = [], isLoading } = useQuery({
    queryKey: ["escape-room-replays", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Replay[]> => {
      const { data, error } = await supabase
        .from("escape_room_sessions")
        .select("id, room_id, completed_at, completion_time_seconds, score, hints_used, escape_rooms!inner(title)")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((r: any) => {
        const totalPuzzles = 8;
        const puzzlesSolved = Math.round((Number(r.score) || 0) / 100 * totalPuzzles);
        const dur = Number(r.completion_time_seconds) || 0;
        return {
          id: r.id,
          roomName: r.escape_rooms?.title ?? "Escape Room",
          completedAt: r.completed_at ? new Date(r.completed_at).toISOString().slice(0, 10) : "—",
          duration: fmtSec(dur),
          score: Number(r.score) || 0,
          puzzlesSolved,
          totalPuzzles,
          hintsUsed: Number(r.hints_used) || 0,
          avgSolveTime: fmtSec(puzzlesSolved > 0 ? Math.round(dur / puzzlesSolved) : 0),
        };
      });
    },
    staleTime: 30_000,
  });


  if (selected) {
    return (
    <>
      <FloatingHowItWorks title={"Room Replay View - How it works"} steps={[{ title: 'Open', desc: 'Access the Room Replay View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room Replay View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Replays</Button>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-black mb-4">{selected.roomName} — Replay Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Time", value: selected.duration, icon: Clock },
              { label: "Score", value: `${selected.score}/100`, icon: TrendingUp },
              { label: "Puzzles", value: `${selected.puzzlesSolved}/${selected.totalPuzzles}`, icon: Brain },
              { label: "Hints Used", value: String(selected.hintsUsed), icon: Eye },
            ].map((s, i) => (
              <Card key={i}><CardContent className="p-4 text-center">
                <s.icon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>

          <Card className="mb-4">
            <CardHeader><CardTitle>Puzzle-by-Puzzle Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: selected.totalPuzzles }).map((_, i) => {
                  const solved = i < selected.puzzlesSolved;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${solved ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${solved ? "bg-green-500" : "bg-red-500"}`} style={{ width: solved ? "100%" : "40%" }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">{solved ? selected.avgSolveTime : "Failed"}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => toast.info("Replay playback starting...")} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <Play className="w-4 h-4 mr-2" />Watch Full Replay
          </Button>
        </motion.div>
      </div>
    </>
  );
  }

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Room Replay</h2>
            <p className="text-muted-foreground text-sm">Review completed rooms with detailed analytics</p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
      ) : replays.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          No completed rooms yet. Finish an escape room to see your replays here.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {replays.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="cursor-pointer hover:border-blue-500/30 transition-colors" onClick={() => setSelected(r)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">{r.roomName}</h4>
                    <p className="text-xs text-muted-foreground">{r.completedAt} · {r.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={r.score >= 90 ? "bg-green-500/20 text-green-500" : r.score >= 70 ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"}>
                      {r.score}/100
                    </Badge>
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
