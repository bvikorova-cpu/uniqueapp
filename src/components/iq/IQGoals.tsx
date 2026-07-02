import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Calendar, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Progress = {
  target_iq: number;
  target_date: string | null;
  starting_iq: number | null;
  current_best: number;
  progress_pct: number;
  achieved: boolean;
  days_remaining: number | null;
  note: string | null;
};

const IQGoals = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState("130");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase.rpc("get_iq_goal_progress");
    const row = (data as Progress[] | null)?.[0] ?? null;
    setProgress(row);
    if (row) {
      setTarget(String(row.target_iq));
      setDate(row.target_date ?? "");
      setNote(row.note ?? "");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast({ title: "Sign in required" }); return; }
    const t = parseInt(target, 10);
    if (!Number.isFinite(t) || t < 60 || t > 200) {
      toast({ title: "Invalid target", description: "Target IQ must be 60–200", variant: "destructive" });
      return;
    }
    const { data: stats } = await supabase.from("iq_user_stats").select("best_iq").eq("user_id", session.user.id).maybeSingle();
    const startingIq = stats?.best_iq ?? 0;
    const { error } = await supabase.from("iq_user_goals").upsert({
      user_id: session.user.id,
      target_iq: t,
      target_date: date || null,
      starting_iq: progress?.starting_iq ?? startingIq,
      note: note || null,
    }, { onConflict: "user_id" });
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Goal saved" });
    setEditing(false);
    load();
  };

  const remove = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("iq_user_goals").delete().eq("user_id", session.user.id);
    setProgress(null);
    setEditing(false);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQGoals works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> IQ Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {!loading && progress && !editing && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{progress.current_best} / {progress.target_iq}</div>
                <div className="text-xs text-muted-foreground">Current best vs target IQ</div>
              </div>
              {progress.achieved && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500">
                  <Trophy className="w-3 h-3 mr-1" /> Achieved
                </Badge>
              )}
            </div>
            <Progress value={Number(progress.progress_pct)} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.progress_pct}% complete</span>
              {progress.days_remaining !== null && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {progress.days_remaining} days left
                </span>
              )}
            </div>
            {progress.note && (
              <p className="text-sm italic text-muted-foreground border-l-2 border-primary/40 pl-3">
                "{progress.note}"
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={remove}>Remove</Button>
            </div>
          </>
        )}

        {!loading && (!progress || editing) && (
          <>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <span>Set a target IQ to focus your training and track progress.</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goal-target">Target IQ</Label>
                <Input id="goal-target" type="number" min={60} max={200} value={target} onChange={e => setTarget(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="goal-date">Target date (optional)</Label>
                <Input id="goal-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="goal-note">Motivation (optional)</Label>
              <Input id="goal-note" maxLength={140} value={note} onChange={e => setNote(e.target.value)} placeholder="Why this goal matters to you" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save}>Save goal</Button>
              {progress && <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQGoals;
