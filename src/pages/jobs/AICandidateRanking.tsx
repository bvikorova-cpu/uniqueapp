import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, ArrowLeft, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_AICANDIDATERANKING = [
  { title: "Pick a job", desc: "Select an active job with applicants." },
  { title: "Run the ranking", desc: "AI scores each applicant on skills, experience, culture fit signals." },
  { title: "Read the reasoning", desc: "Every score is explained \u2014 you can override the ranking and give AI feedback." },
];

export default function AICandidateRanking() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar?: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    const { data: j } = await (supabase as any).from("job_listings").select("*").eq("id", jobId).maybeSingle();
    setJob(j);
    const { data: apps } = await (supabase as any).from("job_applications")
      .select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    setApplications(apps ?? []);
    const { data: r } = await (supabase as any).from("ai_candidate_rankings")
      .select("*").eq("job_id", jobId).order("rank_position", { ascending: true });
    setRankings(r ?? []);

    // Resolve candidate display names via profiles
    const ids = Array.from(new Set([
      ...(apps ?? []).map((a: any) => a.applicant_id).filter(Boolean),
      ...(r ?? []).map((x: any) => x.candidate_id).filter(Boolean),
    ]));
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", ids as string[]);
      const map: Record<string, { name: string; avatar?: string | null }> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = { name: p.full_name || p.username || p.id.slice(0, 8), avatar: p.avatar_url };
      });
      setProfiles(map);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [jobId]);

  const runRanking = async () => {
    if (!job || applications.length === 0) return toast.error("No applications to rank");
    setRunning(true);
    try {
      const candidates = applications.map(a => ({
        candidate_id: a.applicant_id || a.user_id || a.id,
        cover_letter: a.cover_letter,
        resume_url: a.resume_url,
        notes: a.notes,
      }));
      const { data, error } = await supabase.functions.invoke("ai-rank-candidates", {
        body: {
          jobId,
          jobTitle: job.title,
          jobDescription: job.description,
          candidates,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Ranking complete");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/15 via-primary/10 to-fuchsia-500/5 border border-violet-500/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl"><Sparkles className="h-7 w-7 text-white" /></div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black">AI Candidate Ranking</h1>
            <p className="text-sm text-muted-foreground">{job?.title} · {applications.length} applications</p>
          </div>
          <Button onClick={runRanking} disabled={running || applications.length === 0}>
            {running ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Run AI ranking (5cr)
          </Button>
        </div>
      </motion.div>

      {rankings.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-10 text-center text-muted-foreground">
          No rankings yet. Click "Run AI ranking" to score candidates.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rankings.map(r => (
            <Card key={r.id}><CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={r.rank_position <= 3 ? "default" : "secondary"}>
                    <Trophy className="h-3 w-3 mr-1" /> #{r.rank_position}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {profiles[r.candidate_id]?.name || (r.candidate_id?.slice(0, 8) ?? "Unknown")}
                  </span>
                </div>
                <span className="text-2xl font-black text-primary">{r.score}</span>
              </div>
              <Progress value={r.score} />
              <p className="text-sm">{r.reasoning}</p>
              {r.strengths?.length > 0 && (
                <div className="text-xs space-y-1">
                  {r.strengths.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              )}
              {r.concerns?.length > 0 && (
                <div className="text-xs space-y-1">
                  {r.concerns.map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {c}
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
