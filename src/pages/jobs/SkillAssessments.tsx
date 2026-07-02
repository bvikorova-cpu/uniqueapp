import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_SKILLASSESSMENTS = [
  { title: "Pick an assessment", desc: "Browse tests by skill (SQL, React, Excel\u2026). Each shows length and difficulty." },
  { title: "Take the test", desc: "Timed multiple-choice + short answers. No pausing once started." },
  { title: "Get a verified badge", desc: "Passing awards a badge shown on your profile \u2014 employers can filter by it." },
];

export default function SkillAssessments() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: as } = await (supabase as any).from("skill_assessments").select("*").eq("is_public", true).order("created_at", { ascending: false });
    setItems(as ?? []);
    if (user) {
      const { data: at } = await (supabase as any).from("skill_assessment_attempts").select("*").eq("user_id", user.id);
      const m: Record<string, any> = {};
      (at ?? []).forEach((x: any) => { if (!m[x.assessment_id] || x.score > m[x.assessment_id].score) m[x.assessment_id] = x; });
      setAttempts(m);
    }
    setLoading(false);
  })(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Skill Assessments" intro="Prove your skills with short verified tests." steps={HOW_STEPS_SKILLASSESSMENTS} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-orange-500/5 border border-amber-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl"><Award className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Skill Assessments</h1>
          <p className="text-xs text-muted-foreground">Prove your skills. Get verified badges.</p>
        </div>
      </motion.div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
        items.length === 0 ? <Card className="border-dashed"><CardContent className="py-16 text-center text-muted-foreground">No assessments yet.</CardContent></Card> :
        <div className="grid sm:grid-cols-2 gap-3">{items.map((a: any) => {
          const attempt = attempts[a.id];
          return (
            <Card key={a.id} className="hover:border-amber-500/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{a.skill}</p>
                  </div>
                  {attempt?.passed && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">{a.difficulty}</Badge>
                  <Badge variant="outline" className="text-[10px]">{a.time_limit_minutes}min</Badge>
                  <Badge variant="outline" className="text-[10px]">Pass {a.passing_score}%</Badge>
                  {attempt && <Badge variant="secondary" className="text-[10px]">Best: {attempt.score}%</Badge>}
                </div>
                <Button size="sm" className="w-full" onClick={() => navigate(`/jobs/assessments/${a.id}`)}>{attempt ? "Retake" : "Start"}</Button>
              </CardContent>
            </Card>
          );
        })}</div>}
    </div>
  );
}
