import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, Loader2 } from "lucide-react";
import { useMoodTracker, useMoodHistory } from "@/hooks/useHandwritingPro";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const MoodTrackerCard = () => {
  const [imageUrl, setImageUrl] = useState(""); const [notes, setNotes] = useState("");
  const m = useMoodTracker(); const { data: history } = useMoodHistory();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => setImageUrl(r.result as string); r.readAsDataURL(f);
  };

  const chartData = (history ?? []).slice().reverse().map((s: any) => ({
    date: new Date(s.scan_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Mood: s.mood_score, Stress: s.stress_score, Energy: s.energy_score, Focus: s.focus_score,
  }));

  return (
    <>
      <FloatingHowItWorks title={"Mood Tracker Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Mood Tracker Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mood Tracker Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-700" /> Mood & Stress Tracker</span>
          <Badge variant="secondary">3 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs">Today's handwriting sample</Label>
        <Input type="file" accept="image/*" onChange={onFile} />
        {imageUrl && <img src={imageUrl} className="max-h-28 rounded border" alt="today" />}
        <Input placeholder="Optional notes (mood, sleep, situation)" value={notes} onChange={e => setNotes(e.target.value)} />
        <Button
          disabled={!imageUrl || m.isPending}
          onClick={() => m.mutate({ imageUrl, notes }, { onSuccess: () => { setImageUrl(""); setNotes(""); } })}
          className="w-full bg-gradient-to-r from-emerald-700 to-amber-700"
        >
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning…</> : "Record Daily Scan"}
        </Button>

        {chartData.length > 0 && (
          <div className="pt-3">
            <div className="text-xs font-semibold mb-2">Last {chartData.length} scans</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Line type="monotone" dataKey="Mood" stroke="hsl(150 60% 40%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Stress" stroke="hsl(0 65% 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Energy" stroke="hsl(40 85% 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Focus" stroke="hsl(220 60% 50%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
