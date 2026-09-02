import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lightbulb, Loader2, XCircle } from "lucide-react";
import { getHubLesson } from "@/data/educationLessons";
import { useHubLessonProgress, useHubExerciseScores, useCompleteHubLesson, useSubmitHubExercise } from "@/hooks/useHubLessons";

export default function LessonDetail() {
  const { courseKey = "", lessonKey = "" } = useParams();
  const { course, lesson } = getHubLesson(courseKey, lessonKey);
  const { data: progress = [] } = useHubLessonProgress();
  const { data: scores = [] } = useHubExerciseScores();
  const complete = useCompleteHubLesson();
  const submit = useSubmitHubExercise();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  if (!course || !lesson) return <Navigate to="/education/lessons" replace />;

  const done = progress.some((p) => p.course_key === course.key && p.lesson_key === lesson.key);
  const savedScore = scores.find((s) => s.course_key === course.key && s.lesson_key === lesson.key)?.score ?? null;

  const idx = course.lessons.findIndex((l) => l.key === lesson.key);
  const next = course.lessons[idx + 1];
  const prev = course.lessons[idx - 1];

  const answeredAll = lesson.quiz.every((_, i) => answers[i]);
  const correctCount = lesson.quiz.filter((q, i) => answers[i] === q.correct).length;
  const score = Math.round((correctCount / lesson.quiz.length) * 100);

  const handleCheck = async () => {
    setChecked(true);
    await submit.mutateAsync({
      courseKey: course.key,
      lessonKey: lesson.key,
      score,
      answers: lesson.quiz.map((_, i) => answers[i] ?? ""),
    });
    if (!done && score >= 60) {
      complete.mutate({ courseKey: course.key, lessonKey: lesson.key });
    }
  };

  return (
    <>
      <Helmet>
        <title>{lesson.title} · Education</title>
        <meta name="description" content={lesson.summary} />
      </Helmet>

      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
          <Link to="/education/lessons"><ArrowLeft className="w-4 h-4" />All lessons</Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary">{course.title}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />{lesson.minutes} min
            </span>
            {done && (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 gap-1">
                <CheckCircle2 className="w-3 h-3" />Completed
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.summary}</p>
          <Progress value={((idx + 1) / course.lessons.length) * 100} className="h-1.5 mt-4" />
          <p className="text-[11px] text-muted-foreground mt-1">Lesson {idx + 1} of {course.lessons.length}</p>
        </motion.div>

        <div className="space-y-4 mb-6">
          {lesson.sections.map((s) => (
            <Card key={s.heading} className="backdrop-blur-xl bg-card/80">
              <CardContent className="p-5">
                <h2 className="font-bold mb-2">{s.heading}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-primary" />Key points
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
              {lesson.keyPoints.map((k) => <li key={k}>{k}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 backdrop-blur-xl bg-card/80">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="font-bold">Exercise · {lesson.quiz.length} questions</h2>
              {savedScore !== null && (
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Best saved: {savedScore}%</Badge>
              )}
            </div>

            <div className="space-y-5">
              {lesson.quiz.map((q, i) => (
                <div key={q.question}>
                  <p className="text-sm font-medium mb-2">{i + 1}. {q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt) => {
                      const selected = answers[i] === opt;
                      const showRight = checked && opt === q.correct;
                      const showWrong = checked && selected && opt !== q.correct;
                      return (
                        <Button
                          key={opt}
                          type="button"
                          variant="outline"
                          onClick={() => !checked && setAnswers((a) => ({ ...a, [i]: opt }))}
                          className={`justify-start h-auto py-2 text-left whitespace-normal
                            ${selected && !checked ? "border-primary bg-primary/10" : ""}
                            ${showRight ? "border-emerald-500 bg-emerald-500/10" : ""}
                            ${showWrong ? "border-rose-500 bg-rose-500/10" : ""}`}
                        >
                          {showRight && <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />}
                          {showWrong && <XCircle className="w-4 h-4 mr-2 text-rose-500 shrink-0" />}
                          {opt}
                        </Button>
                      );
                    })}
                  </div>
                  {checked && (
                    <p className="text-xs text-muted-foreground mt-2">{q.explanation}</p>
                  )}
                </div>
              ))}
            </div>

            {!checked ? (
              <Button
                className="w-full mt-5"
                disabled={!answeredAll || submit.isPending}
                onClick={handleCheck}
              >
                {submit.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit exercise (+10 XP)
              </Button>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <div className="text-3xl font-black">{score}%</div>
                  <p className="text-xs text-muted-foreground">{correctCount} of {lesson.quiz.length} correct</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setChecked(false); setAnswers({}); }}>
                  Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          {!done && (
            <Button
              onClick={() => complete.mutate({ courseKey: course.key, lessonKey: lesson.key })}
              disabled={complete.isPending}
              className="gap-2"
            >
              {complete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Mark lesson complete (+15 XP)
            </Button>
          )}
          {prev && (
            <Button asChild variant="outline" className="gap-2">
              <Link to={`/education/lessons/${course.key}/${prev.key}`}><ArrowLeft className="w-4 h-4" />Previous</Link>
            </Button>
          )}
          {next && (
            <Button asChild variant="outline" className="gap-2">
              <Link to={`/education/lessons/${course.key}/${next.key}`}>Next lesson<ArrowRight className="w-4 h-4" /></Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
