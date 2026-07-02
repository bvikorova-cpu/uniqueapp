import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { InterviewQuestionDialog } from "@/components/jobs/InterviewQuestionDialog";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_INTERVIEWQUESTIONS = [
  { title: "Enter role & seniority", desc: "e.g. Senior Backend Engineer, Product Manager." },
  { title: "Get a question set", desc: "Behavioural, technical and role-specific questions with model answers." },
  { title: "Send to a candidate", desc: "Attach the set to an ATS stage \u2014 candidate answers in-app or on video." },
];

export default function InterviewQuestions() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("interview_questions").select("*").order("created_at", { ascending: false }).limit(200);
    if (q.trim()) query = query.or(`question.ilike.%${q.trim()}%,job_title.ilike.%${q.trim()}%,company_name.ilike.%${q.trim()}%`);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <SEO title="Interview Questions" description="Real interview questions reported by candidates, with tips." />
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-pink-500/10 border border-primary/20 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-pink-500 shadow-xl shadow-primary/30">
              <HelpCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Interview Questions</h1>
              <p className="text-sm text-muted-foreground">{items.length} reported</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Share a question</Button>
        </div>
      </motion.div>

      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions, role, company..." onKeyDown={e => e.key === "Enter" && load()} />
        <Button variant="secondary" onClick={load}>Search</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
        items.length === 0 ? <Card className="border-dashed border-2"><CardContent className="py-16 text-center text-muted-foreground">No questions yet. Be the first to share.</CardContent></Card> :
        <div className="space-y-3">
          {items.map(it => (
            <Card key={it.id}><CardContent className="p-4">
              <div className="flex justify-between gap-2 items-start">
                <h3 className="font-semibold">{it.question}</h3>
                <Badge variant="outline" className="capitalize shrink-0">{it.difficulty}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{it.job_title}{it.company_name ? ` @ ${it.company_name}` : ""} · {it.category}</p>
              {it.answer_tips && <p className="text-sm mt-2 text-muted-foreground">💡 {it.answer_tips}</p>}
            </CardContent></Card>
          ))}
        </div>
      }

      <InterviewQuestionDialog open={open} onOpenChange={setOpen} onSubmitted={load} />
    </div>
  );
}
