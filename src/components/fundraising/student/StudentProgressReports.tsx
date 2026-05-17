import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Award, Plus, FileText, BookCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Report {
  id: string;
  semester: string;
  gpa: number | null;
  courses_completed: number | null;
  achievements: string | null;
  transcript_url: string | null;
  created_at: string;
}

interface Props {
  campaignId: string;
  ownerUserId: string;
}

export function StudentProgressReports({ campaignId, ownerUserId }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ semester: "", gpa: "", courses_completed: "", achievements: "", transcript_url: "" });
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("student_progress_reports" as any)
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    setReports((data as unknown as Report[]) || []);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === ownerUserId));
  }, [campaignId, ownerUserId]);

  const post = async () => {
    if (!form.semester.trim()) {
      toast({ title: "Semester required", variant: "destructive" });
      return;
    }
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("student_progress_reports" as any).insert({
      campaign_id: campaignId,
      author_user_id: user?.id,
      semester: form.semester.trim().slice(0, 80),
      gpa: form.gpa ? parseFloat(form.gpa) : null,
      courses_completed: form.courses_completed ? parseInt(form.courses_completed) : null,
      achievements: form.achievements.trim() || null,
      transcript_url: form.transcript_url.trim() || null,
    });
    setPosting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ semester: "", gpa: "", courses_completed: "", achievements: "", transcript_url: "" });
    setShowForm(false);
    load();
    toast({ title: "Progress report posted 🎓" });
  };

  if (reports.length === 0 && !isOwner) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Academic Progress</h3>
        <Badge variant="outline" className="ml-2">{reports.length}</Badge>
        {isOwner && (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4 mr-1" /> Add Report
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 mb-4 p-3 rounded-lg border bg-muted/20">
          <Input placeholder="Semester (e.g. Fall 2026)" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="GPA" type="number" step="0.01" max="4" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
            <Input placeholder="Courses done" type="number" value={form.courses_completed} onChange={(e) => setForm({ ...form, courses_completed: e.target.value })} />
          </div>
          <Textarea placeholder="Achievements, awards, key projects..." rows={3} className="resize-none" value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} />
          <Input placeholder="Transcript URL (optional)" value={form.transcript_url} onChange={(e) => setForm({ ...form, transcript_url: e.target.value })} />
          <Button onClick={post} disabled={posting} size="sm" className="w-full">
            {posting ? "Posting..." : "Publish Report"}
          </Button>
        </div>
      )}

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Progress reports will appear here each semester so donors can see the impact of their support.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <BookCheck className="w-4 h-4 text-primary" />
                <h5 className="font-bold text-sm">{r.semester}</h5>
                {r.gpa != null && (
                  <Badge variant="default" className="ml-auto text-xs gap-1">
                    <Award className="w-3 h-3" /> GPA {r.gpa.toFixed(2)}
                  </Badge>
                )}
                {r.courses_completed != null && (
                  <Badge variant="outline" className="text-xs">{r.courses_completed} courses</Badge>
                )}
              </div>
              {r.achievements && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.achievements}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span>{format(new Date(r.created_at), "MMM d, yyyy")}</span>
                {r.transcript_url && (
                  <a href={r.transcript_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <FileText className="w-3 h-3" /> View transcript
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
