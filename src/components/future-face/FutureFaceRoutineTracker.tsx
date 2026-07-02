import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sun, Moon, Droplet, BedDouble, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Row {
  routine_date: string; morning_done: boolean; evening_done: boolean;
  hydration_glasses: number; sleep_hours: number;
}

export default function FutureFaceRoutineTracker() {
  const today = new Date().toISOString().slice(0, 10);
  const [today_, setToday] = useState<Row>({
    routine_date: today, morning_done: false, evening_done: false,
    hydration_glasses: 0, sleep_hours: 0,
  });
  const [history, setHistory] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase
      .from("future_face_routine_log")
      .select("*")
      .order("routine_date", { ascending: false })
      .limit(30);
    if (data) {
      setHistory(data as any);
      const t = (data as any[]).find(r => r.routine_date === today);
      if (t) setToday(t);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (patch: Partial<Row>) => {
    const next = { ...today_, ...patch };
    setToday(next);
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBusy(false); return; }
    const row = { user_id: session.user.id, ...next };
    const { error } = await supabase.from("future_face_routine_log").upsert(row, { onConflict: "user_id,routine_date" });
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else load();
    setBusy(false);
  };

  // Streak: consecutive days with morning AND evening
  let streak = 0;
  const map = new Map(history.map(r => [r.routine_date, r]));
  let d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().slice(0, 10);
    const r = map.get(key);
    if (r && r.morning_done && r.evening_done) streak++;
    else if (key !== today) break;
    d.setDate(d.getDate() - 1);
  }
  const last7 = history.slice(0, 7).filter(r => r.morning_done && r.evening_done).length;
  const compliance = history.length ? Math.round((history.filter(r => r.morning_done && r.evening_done).length / history.length) * 100) : 0;

  if (loading) return <div className="grid place-items-center h-48"><Loader2 className="h-6 w-6 animate-spin text-cyan-500" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Future Face Routine Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Routine Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Routine Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🧴 Daily Routine</h2>
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 gap-1">
          <Flame className="h-3 w-3" /> {streak}d streak
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-card/60"><CardContent className="p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground">7-day</p>
          <p className="text-xl font-black">{last7}/7</p>
        </CardContent></Card>
        <Card className="bg-card/60"><CardContent className="p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground">Compliance</p>
          <p className="text-xl font-black">{compliance}%</p>
        </CardContent></Card>
        <Card className="bg-card/60"><CardContent className="p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground">Logged days</p>
          <p className="text-xl font-black">{history.length}</p>
        </CardContent></Card>
      </div>

      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase">Today · {today}</p>

          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-card/60">
            <Checkbox checked={today_.morning_done} onCheckedChange={v => save({ morning_done: !!v })} />
            <Sun className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-bold">Morning skincare done</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-card/60">
            <Checkbox checked={today_.evening_done} onCheckedChange={v => save({ evening_done: !!v })} />
            <Moon className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-bold">Evening skincare done</span>
          </label>

          <div className="flex items-center gap-2 p-2 rounded-lg">
            <Droplet className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold flex-1">Water (glasses)</span>
            <Input type="number" min="0" max="20" value={today_.hydration_glasses}
              onChange={e => save({ hydration_glasses: parseInt(e.target.value) || 0 })}
              className="w-20" />
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg">
            <BedDouble className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-bold flex-1">Sleep (hours)</span>
            <Input type="number" min="0" max="24" step="0.5" value={today_.sleep_hours}
              onChange={e => save({ sleep_hours: parseFloat(e.target.value) || 0 })}
              className="w-20" />
          </div>

          {busy && <p className="text-xs text-muted-foreground text-center">Saving…</p>}

          {/* 30-day grid */}
          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase mb-2 text-muted-foreground">Last 30 days</p>
            <div className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0,1fr))" }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const dt = new Date(); dt.setDate(dt.getDate() - (29 - i));
                const key = dt.toISOString().slice(0, 10);
                const r = map.get(key);
                const both = r && r.morning_done && r.evening_done;
                const half = r && (r.morning_done || r.evening_done);
                return (
                  <div key={key} title={key}
                    className={`aspect-square rounded ${both ? "bg-emerald-500" : half ? "bg-amber-500/60" : "bg-muted"}`}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
