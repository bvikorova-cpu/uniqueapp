import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pause, AlertCircle } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Status {
  used: number;
  limit: number;
  remaining: number;
  max_months_per_pause: number;
  history: { paused_at: string; resumes_at: string | null; months: number }[];
}

export default function PauseLimitCard() {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.functions.invoke("get-pause-status");
      if (data && !data.error) setS(data as Status);
    })();
  }, []);

  if (!s) return null;
  const pct = s.limit > 0 ? (s.used / s.limit) * 100 : 0;
  const exhausted = s.remaining === 0;

  return (
    <>
      <FloatingHowItWorks title={"Pause Limit Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Pause Limit Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pause Limit Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 bg-card/50 backdrop-blur">
      <div className="flex items-center gap-2 mb-2">
        <Pause className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Pause allowance</h3>
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        {s.used} of {s.limit} pauses used in the last 12 months
        {" · "}up to {s.max_months_per_pause} month(s) per pause
      </div>
      <Progress value={pct} className="h-2" />
      {exhausted && (
        <div className="flex items-start gap-2 mt-3 text-xs text-amber-500">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Pause limit reached. You can pause again once an older pause rolls past 12 months.</span>
        </div>
      )}
      {s.history.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-muted-foreground">Recent pauses</summary>
          <ul className="mt-2 space-y-1">
            {s.history.map((h, i) => (
              <li key={i} className="font-mono">
                {new Date(h.paused_at).toLocaleDateString()} — {h.months}mo
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
    </>
  );
}
