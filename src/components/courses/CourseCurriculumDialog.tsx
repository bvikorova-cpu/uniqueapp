import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  moduleCourseApi,
  lessonKey,
  type Curriculum,
  type CourseMetaLite,
  type LessonVideo,
  type ExerciseFeedback,
} from "@/lib/moduleCourseApi";
import {
  BookOpen, Sparkles, Target, Loader2, PlayCircle, FileDown,
  ChevronDown, Lock, Send, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: CourseMetaLite;
  purchased: boolean;
  onTakeExam?: () => void;
  onReadyChange?: (ready: boolean) => void;
}

export const CourseCurriculumDialog = ({ open, onOpenChange, meta, purchased, onTakeExam, onReadyChange }: Props) => {
  const [curr, setCurr] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  const [videos, setVideos] = useState<Record<string, LessonVideo[]>>({});
  const [videosLoading, setVideosLoading] = useState<Record<string, boolean>>({});
  const [subs, setSubs] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, ExerciseFeedback>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<Record<string, boolean>>({});
  const [workbookLoading, setWorkbookLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    moduleCourseApi
      .curriculum(meta)
      .then((c) => setCurr(c))
      .catch((e) => toast.error(e?.message || "Failed to load curriculum"))
      .finally(() => setLoading(false));
    if (purchased) {
      moduleCourseApi.progressGet(meta).then((keys) => setCompletedKeys(new Set(keys))).catch(() => {});
    }
  }, [open, meta.module_key, meta.course_slug, purchased]);

  const totalLessons = useMemo(
    () => (curr?.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0),
    [curr],
  );
  const completedCount = completedKeys.size;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const readyForExam = purchased && percent >= 80;

  useEffect(() => { onReadyChange?.(readyForExam); }, [readyForExam, onReadyChange]);

  const toggleLesson = async (key: string, checked: boolean) => {
    if (!purchased) { toast.error("Enroll first to track progress."); return; }
    const next = new Set(completedKeys);
    if (checked) next.add(key); else next.delete(key);
    setCompletedKeys(next);
    try { await moduleCourseApi.progressSet(meta, key, checked); }
    catch (e: any) { toast.error(e?.message || "Failed to save progress"); }
  };

  const loadVideos = async (key: string, title: string) => {
    if (videos[key] || videosLoading[key]) return;
    setVideosLoading((s) => ({ ...s, [key]: true }));
    try {
      const v = await moduleCourseApi.videos(meta, key, title);
      setVideos((s) => ({ ...s, [key]: v }));
    } catch (e: any) { toast.error(e?.message || "Failed to load videos"); }
    finally { setVideosLoading((s) => ({ ...s, [key]: false })); }
  };

  const submitFeedback = async (key: string, title: string, exercise: string) => {
    if (!purchased) { toast.error("Enroll first to submit exercises."); return; }
    const txt = (subs[key] || "").trim();
    if (txt.length < 20) { toast.error("Please write at least 20 characters."); return; }
    setFeedbackLoading((s) => ({ ...s, [key]: true }));
    try {
      const res = await moduleCourseApi.feedback(meta, {
        lesson_key: key, lesson_title: title, exercise, submission: txt,
      });
      setFeedbacks((s) => ({ ...s, [key]: res.feedback }));
      toast.success(`AI feedback ready — score ${res.score}/100`);
    } catch (e: any) { toast.error(e?.message || "Failed to get feedback"); }
    finally { setFeedbackLoading((s) => ({ ...s, [key]: false })); }
  };

  const downloadWorkbook = async () => {
    if (!purchased) { toast.error("Enroll to download the workbook."); return; }
    setWorkbookLoading(true);
    try {
      const url = await moduleCourseApi.workbook(meta);
      window.open(url, "_blank");
    } catch (e: any) { toast.error(e?.message || "Failed to generate workbook"); }
    finally { setWorkbookLoading(false); }
  };

  const renderLessonRow = (mi: number, li: number, l: any) => {
    const key = lessonKey(mi, li);
    const done = completedKeys.has(key);
    const title = `Lesson ${mi + 1}.${li + 1}: ${l.title}`;
    return (
      <div key={key} className="border-l-2 border-primary/40 pl-3 py-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id={`chk-${key}`}
            checked={done}
            onCheckedChange={(v) => toggleLesson(key, !!v)}
            disabled={!purchased}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <label htmlFor={`chk-${key}`} className={`font-semibold text-sm cursor-pointer ${done ? "line-through text-muted-foreground" : ""}`}>
              {title}
            </label>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{l.content}</p>
            {l.key_points?.length ? (
              <ul className="mt-2 text-xs list-disc pl-5 space-y-0.5">
                {l.key_points.map((k: string, ki: number) => (<li key={ki}>{k}</li>))}
              </ul>
            ) : null}
            {l.exercise && (
              <p className="text-xs mt-2 bg-accent/10 rounded p-2">
                <span className="font-semibold">Exercise:</span> {l.exercise}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const flatLessons = useMemo(() => {
    const list: { key: string; title: string; exercise: string; mi: number; li: number }[] = [];
    (curr?.modules || []).forEach((m, mi) =>
      (m.lessons || []).forEach((l, li) =>
        list.push({ key: lessonKey(mi, li), title: `${mi + 1}.${li + 1}: ${l.title}`, exercise: l.exercise || "", mi, li }),
      ),
    );
    return list;
  }, [curr]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            {meta.course_title}
          </DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
          {purchased && totalLessons > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold">Progress: {completedCount}/{totalLessons} lessons ({percent}%)</span>
                <span className={readyForExam ? "text-green-600 font-bold" : "text-muted-foreground"}>
                  {readyForExam ? "✓ Ready for final exam" : `Complete ${Math.max(0, Math.ceil(totalLessons * 0.8) - completedCount)} more to unlock exam`}
                </span>
              </div>
              <Progress value={percent} className="h-2" />
            </div>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Building your curriculum…
          </div>
        )}

        {curr && !loading && (
          <Tabs defaultValue="curriculum" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="curriculum">📖 Curriculum</TabsTrigger>
              <TabsTrigger value="videos">🎬 Videos</TabsTrigger>
              <TabsTrigger value="exercises">✍️ Exercises</TabsTrigger>
              <TabsTrigger value="workbook">📄 Workbook</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="overflow-hidden">
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-6 pt-2">
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
                      <h3 className="font-black text-lg mb-2">
                        <Badge variant="secondary" className="mr-2">Module {mi + 1}</Badge>
                        {m.title}
                      </h3>
                      {m.summary && <p className="text-sm text-muted-foreground mb-3">{m.summary}</p>}
                      <div className="space-y-1">
                        {m.lessons?.map((l, li) => renderLessonRow(mi, li, l))}
                      </div>
                    </section>
                  ))}
                  {curr.final_project && (
                    <section className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                      <h3 className="font-black flex items-center gap-2"><Sparkles className="w-4 h-4" /> Final capstone project</h3>
                      <p className="text-sm mt-2 whitespace-pre-wrap">{curr.final_project}</p>
                    </section>
                  )}
                  {onTakeExam && (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => { onOpenChange(false); onTakeExam(); }}
                      disabled={!readyForExam}
                    >
                      {readyForExam ? "Take Final Exam →" : <><Lock className="w-4 h-4 mr-2" /> Complete 80% of lessons to unlock exam</>}
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="videos" className="overflow-hidden">
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Curated video tutorials from YouTube per lesson. Click a lesson to load its videos.
                  </p>
                  {flatLessons.map(({ key, title }) => (
                    <Collapsible key={key} onOpenChange={(o) => o && loadVideos(key, title)}>
                      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 text-left">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <PlayCircle className="w-4 h-4 text-primary" />
                          Lesson {title}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 space-y-3">
                        {videosLoading[key] && <Loader2 className="w-4 h-4 animate-spin" />}
                        {videos[key]?.map((v, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs font-medium">{v.title}</p>
                            <div className="aspect-video rounded-lg overflow-hidden bg-black">
                              <iframe
                                src={v.embed_url}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={v.title}
                              />
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="exercises" className="overflow-hidden">
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-3 pt-2">
                  {!purchased && (
                    <div className="p-3 rounded-lg bg-muted text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Enroll to submit exercises and get AI feedback.
                    </div>
                  )}
                  {flatLessons.filter((l) => l.exercise).map(({ key, title, exercise }) => {
                    const fb = feedbacks[key];
                    return (
                      <div key={key} className="border rounded-lg p-3 space-y-2">
                        <p className="font-semibold text-sm">Lesson {title}</p>
                        <p className="text-xs bg-accent/10 rounded p-2"><span className="font-semibold">Exercise:</span> {exercise}</p>
                        <Textarea
                          rows={4}
                          placeholder="Write your answer here (min 20 chars)…"
                          value={subs[key] || ""}
                          onChange={(e) => setSubs((s) => ({ ...s, [key]: e.target.value }))}
                          disabled={!purchased}
                        />
                        <Button
                          size="sm"
                          onClick={() => submitFeedback(key, title, exercise)}
                          disabled={!purchased || feedbackLoading[key]}
                        >
                          {feedbackLoading[key] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                          Get AI feedback
                        </Button>
                        {fb && (
                          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2 text-sm">
                            <div className="flex items-center gap-2 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-green-600" /> Score: {fb.score}/100
                            </div>
                            {fb.summary && <p className="text-xs">{fb.summary}</p>}
                            {fb.strengths?.length ? (
                              <div><p className="text-xs font-semibold text-green-700">Strengths:</p>
                                <ul className="text-xs list-disc pl-5">{fb.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                            ) : null}
                            {fb.improvements?.length ? (
                              <div><p className="text-xs font-semibold text-orange-700">Improvements:</p>
                                <ul className="text-xs list-disc pl-5">{fb.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                            ) : null}
                            {fb.next_step && <p className="text-xs"><span className="font-semibold">Next step:</span> {fb.next_step}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="workbook" className="overflow-hidden">
              <div className="p-6 text-center space-y-4">
                <FileDown className="w-16 h-16 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Complete Course Workbook</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Download a printable A4 PDF containing the full curriculum, all lessons, key points, exercises, and the final capstone project.
                </p>
                <Button size="lg" onClick={downloadWorkbook} disabled={!purchased || workbookLoading}>
                  {workbookLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
                  {purchased ? "Download workbook PDF" : "Enroll to download workbook"}
                </Button>
                {curr.resources?.length ? (
                  <div className="text-left mt-6 max-w-md mx-auto">
                    <h4 className="font-bold text-sm mb-2">Additional resources</h4>
                    <ul className="text-sm space-y-1">
                      {curr.resources.map((r, i) => (
                        <li key={i}>• <strong>{r.label}</strong>{r.hint ? ` — ${r.hint}` : ""}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
