import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { moduleCourseApi, type Curriculum, type CourseMetaLite } from "@/lib/moduleCourseApi";
import { BookOpen, Sparkles, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: CourseMetaLite;
  onTakeExam?: () => void;
}

export const CourseCurriculumDialog = ({ open, onOpenChange, meta, onTakeExam }: Props) => {
  const [curr, setCurr] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    moduleCourseApi
      .curriculum(meta)
      .then((c) => setCurr(c))
      .catch((e) => toast.error(e?.message || "Failed to load curriculum"))
      .finally(() => setLoading(false));
  }, [open, meta.module_key, meta.course_slug]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            {meta.course_title} — Full Curriculum
          </DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Building your curriculum…
            </div>
          )}

          {curr && (
            <div className="space-y-6">
              <section>
                <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Course overview</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{curr.overview}</p>
              </section>

              {curr.learning_outcomes?.length ? (
                <section>
                  <h3 className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> What you'll learn</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {curr.learning_outcomes.map((o, i) => (
                      <li key={i} className="text-sm bg-primary/5 rounded-lg p-2">✓ {o}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {curr.modules?.map((m, mi) => (
                <section key={mi} className="border rounded-xl p-4 bg-card/60 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-black text-lg">
                      <Badge variant="secondary" className="mr-2">Module {mi + 1}</Badge>
                      {m.title}
                    </h3>
                  </div>
                  {m.summary && <p className="text-sm text-muted-foreground mb-3">{m.summary}</p>}
                  <div className="space-y-3">
                    {m.lessons?.map((l, li) => (
                      <div key={li} className="border-l-2 border-primary/40 pl-3">
                        <p className="font-semibold text-sm">Lesson {mi + 1}.{li + 1}: {l.title}</p>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{l.content}</p>
                        {l.key_points?.length ? (
                          <ul className="mt-2 text-xs list-disc pl-5 space-y-0.5">
                            {l.key_points.map((k, ki) => (<li key={ki}>{k}</li>))}
                          </ul>
                        ) : null}
                        {l.exercise && (
                          <p className="text-xs mt-2 bg-accent/10 rounded p-2">
                            <span className="font-semibold">Exercise:</span> {l.exercise}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {curr.final_project && (
                <section className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                  <h3 className="font-black flex items-center gap-2"><Sparkles className="w-4 h-4" /> Final capstone project</h3>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{curr.final_project}</p>
                </section>
              )}

              {curr.resources?.length ? (
                <section>
                  <h3 className="font-bold">Resources</h3>
                  <ul className="text-sm space-y-1 mt-2">
                    {curr.resources.map((r, i) => (
                      <li key={i}>• <strong>{r.label}</strong>{r.hint ? ` — ${r.hint}` : ""}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {onTakeExam && (
                <div className="pt-2">
                  <Button size="lg" className="w-full" onClick={() => { onOpenChange(false); onTakeExam(); }}>
                    Take Final Exam →
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
