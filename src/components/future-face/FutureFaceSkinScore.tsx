import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Row { recorded_at: string; score: number; notes?: string | null; }

export default function FutureFaceSkinScore() {
  const [rows, setRows] = useState<Row[]>([]);
  const [score, setScore] = useState("75");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase
      .from("future_face_skin_scores")
      .select("recorded_at, score, notes")
      .order("recorded_at", { ascending: true })
      .limit(60);
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const log = async () => {
    const s = parseInt(score);
    if (isNaN(s) || s < 0 || s > 100) { toast({ title: "Score must be 0–100", variant: "destructive" }); return; }
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBusy(false); return; }
    const { error } = await supabase.from("future_face_skin_scores").insert({
      user_id: session.user.id, score: s, notes: notes || null,
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { setNotes(""); await load(); toast({ title: "Logged!" }); }
    setBusy(false);
  };

  const chartData = rows.map(r => ({
    date: new Date(r.recorded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: r.score,
  }));
  const avg = rows.length ? Math.round(rows.reduce((a, b) => a + b.score, 0) / rows.length) : 0;
  const last = rows[rows.length - 1]?.score ?? 0;
  const trend = rows.length >= 2 ? last - rows[rows.length - 2].score : 0;

  return (
    <>
      <FloatingHowItWorks title={"Future Face Skin Score - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Skin Score section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Skin Score.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">📊 Skin Score Tracker</h2>
        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">{rows.length} entries</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-card/60 border-cyan-500/20"><CardContent className="p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground">Latest</p>
          <p className="text-2xl font-black text-cyan-400">{last}</p>
        </CardContent></Card>
        <Card className="bg-card/60 border-purple-500/20"><CardContent className="p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground">Average</p>
          <p className="text-2xl font-black text-purple-400">{avg}</p>
        </CardContent></Card>
        <Card className="bg-card/60 border-pink-500/20"><CardContent className="p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground">Trend</p>
          <p className={`text-2xl font-black ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trend >= 0 ? "+" : ""}{trend}</p>
        </CardContent></Card>
      </div>

      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="grid place-items-center h-48"><Loader2 className="h-6 w-6 animate-spin text-cyan-500" /></div>
          ) : chartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Log your first score below to start tracking.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <ReferenceLine y={avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="score" stroke="url(#gr)" strokeWidth={3} dot={{ r: 3 }} />
                  <defs>
                    <linearGradient id="gr" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(180 100% 50%)" />
                      <stop offset="100%" stopColor="hsl(280 100% 60%)" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Input type="number" value={score} onChange={e => setScore(e.target.value)} min="0" max="100" placeholder="Score 0-100" className="sm:w-32" />
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" />
            <Button onClick={log} disabled={busy} className="bg-gradient-to-r from-cyan-600 to-purple-600">
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
              Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
