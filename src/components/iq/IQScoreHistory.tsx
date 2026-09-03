import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

/** Real IQ history only — values come from the user's completed tests. */
export default function IQScoreHistory() {
  const [scores, setScores] = useState<number[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { if (!cancelled) setScores([]); return; }
      const { data } = await supabase
        .from("iq_test_results")
        .select("iq_score, score, completed_at")
        .eq("user_id", uid)
        .order("completed_at", { ascending: true })
        .limit(30);
      if (cancelled) return;
      setScores(
        (data ?? [])
          .map((r: { iq_score: number | null; score: number | null }) => r.iq_score ?? r.score ?? 0)
          .filter((n) => n > 0),
      );
    })();
    return () => { cancelled = true; };
  }, []);

  const list = scores ?? [];
  const max = list.length ? Math.max(...list) : 0;
  const min = list.length ? Math.min(...list) : 0;
  const range = max - min || 1;

  return (
    <>
      <FloatingHowItWorks title="How IQScore History works" steps={[
          { title: 'Take a test', desc: 'Complete an IQ test to record a score.' },
          { title: 'Track', desc: 'Every completed test is stored on your account.' },
          { title: 'Review results', desc: 'The chart shows your real score progression.' },
          { title: 'Iterate', desc: 'Retake tests to see how you improve.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Score History</CardTitle></CardHeader>
      <CardContent>
        {scores === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            {list.length === 1
              ? `Your only recorded score so far: ${list[0]}. Take another test to see a trend.`
              : "No completed IQ tests yet — your history will appear here."}
          </p>
        ) : (
          <>
            <svg viewBox="0 0 200 60" className="w-full h-20">
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                points={list.map((s, i) => `${(i / (list.length - 1)) * 200},${60 - ((s - min) / range) * 55}`).join(" ")}
              />
            </svg>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Min: {min}</span><span>Max: {max}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
    );
}
