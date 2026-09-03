import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Flame, BookOpen, Clock, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getColor = (value: number) => {
  if (value === 0) return "bg-muted/50";
  if (value === 1) return "bg-emerald-500/20";
  if (value === 2) return "bg-emerald-500/40";
  if (value === 3) return "bg-emerald-500/60";
  return "bg-emerald-500/90";
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Real learning activity only: every cell is the number of lessons the signed-in
 * user actually completed on that day. No simulated or random values.
 */
export function StudentProgressHeatmapView({ onBack }: Props) {
  const [completedByDay, setCompletedByDay] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { if (!cancelled) setCompletedByDay({}); return; }
      const since = new Date();
      since.setDate(since.getDate() - 12 * 7);
      const { data } = await supabase
        .from("education_lesson_progress")
        .select("completed_at")
        .eq("user_id", uid)
        .gte("completed_at", since.toISOString());
      if (cancelled) return;
      const map: Record<string, number> = {};
      (data ?? []).forEach((row: { completed_at: string | null }) => {
        if (!row.completed_at) return;
        const key = isoDay(new Date(row.completed_at));
        map[key] = (map[key] || 0) + 1;
      });
      setCompletedByDay(map);
    })();
    return () => { cancelled = true; };
  }, []);

  const heatmapData = useMemo(() => {
    const map = completedByDay ?? {};
    const out: { week: number; day: number; value: number; date: string; iso: string }[] = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const iso = isoDay(date);
        out.push({
          week: 11 - w,
          day: d,
          value: map[iso] || 0,
          iso,
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
      }
    }
    return out;
  }, [completedByDay]);

  const totalDays = heatmapData.filter(d => d.value > 0).length;
  const totalLessons = heatmapData.reduce((s, d) => s + d.value, 0);
  const currentStreak = (() => {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].value > 0) streak++;
      else break;
    }
    return streak;
  })();
  const longestStreak = (() => {
    let max = 0, cur = 0;
    heatmapData.forEach(d => { if (d.value > 0) { cur++; max = Math.max(max, cur); } else cur = 0; });
    return max;
  })();

  const weekTotals = [0, 1, 2].map((back) => {
    const startIndex = heatmapData.length - 7 * (back + 1);
    const slice = heatmapData.slice(Math.max(0, startIndex), heatmapData.length - 7 * back);
    return slice.reduce((s, d) => s + d.value, 0);
  });

  return (
    <>
      <FloatingHowItWorks title={"Student Progress Heatmap View - How it works"} steps={[{ title: 'Open', desc: 'Access the Student Progress Heatmap View section from its module.' }, { title: 'Explore', desc: 'Review your real completed lessons per day.' }, { title: 'Interact', desc: 'Hover a cell to see the exact date and lesson count.' }, { title: 'Review', desc: 'Streaks and totals update as you complete lessons.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Student Progress Heatmap</h2>
          <p className="text-sm text-muted-foreground">Your real learning activity over time</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 text-center">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-black">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </Card>
        <Card className="p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-black">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </Card>
        <Card className="p-4 text-center">
          <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-black">{totalDays}</p>
          <p className="text-xs text-muted-foreground">Active Days</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-black">{totalLessons}</p>
          <p className="text-xs text-muted-foreground">Lessons Completed</p>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-4">Learning Activity — Last 12 Weeks</h3>
          {completedByDay === null ? (
            <p className="text-sm text-muted-foreground">Loading your activity…</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="flex gap-0.5 min-w-[500px]">
                  <div className="flex flex-col gap-0.5 mr-2 text-[10px] text-muted-foreground pt-0">
                    {dayLabels.map(d => <div key={d} className="h-4 flex items-center">{d}</div>)}
                  </div>
                  {Array.from({ length: 12 }, (_, w) => (
                    <div key={w} className="flex flex-col gap-0.5">
                      {Array.from({ length: 7 }, (_, d) => {
                        const cell = heatmapData.find(c => c.week === w && c.day === d);
                        return (
                          <div
                            key={d}
                            className={`w-4 h-4 rounded-sm ${getColor(cell?.value || 0)} hover:ring-2 hover:ring-emerald-500/50 cursor-pointer transition-all`}
                            title={`${cell?.date}: ${cell?.value || 0} lessons`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {totalLessons === 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  No completed lessons yet — finish a lesson and it will appear here.
                </p>
              )}
            </>
          )}
          <div className="flex items-center gap-2 mt-4 justify-end text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} className={`w-3 h-3 rounded-sm ${getColor(v)}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-3">Weekly Summary</h3>
          <div className="space-y-2">
            {["This Week", "Last Week", "2 Weeks Ago"].map((label, i) => (
              <div key={label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-sm">{label}</span>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />{weekTotals[i]} lessons</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
