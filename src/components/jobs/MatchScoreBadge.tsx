import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export function MatchScoreBadge({ jobId }: { jobId: string }) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cached } = await supabase.from("job_match_scores").select("score").eq("user_id", user.id).eq("job_id", jobId).maybeSingle();
      if (cached && mounted) { setScore(cached.score); return; }
      try {
        const { data, error } = await supabase.functions.invoke("compute-job-match", { body: { jobId } });
        if (error) return; // silent — badge is non-critical
        if (data?.score !== undefined && mounted) setScore(data.score);
      } catch {
        // silent fail — badge is decorative
      }
    })();
    return () => { mounted = false; };
  }, [jobId]);

  if (score === null) return null;
  const tone = score >= 75 ? "bg-green-500/20 text-green-400 border-green-500/40" : score >= 50 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-muted text-muted-foreground";
  return (
    <>
      <FloatingHowItWorks title="How Match Score Badge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Badge variant="outline" className={tone}>
      <Sparkles className="h-3 w-3 mr-1" /> {score}% match
    </Badge>
    </>
    );
}
