import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";
import { HUB_COURSES, TOTAL_HUB_LESSONS } from "@/data/educationLessons";
import { useHubLessonProgress, useHubExerciseScores } from "@/hooks/useHubLessons";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const HIW = {
  title: "Lessons & Exercises",
  intro: "Real curriculum with reading material and a graded quiz in every lesson.",
  steps: [
    { title: "Pick a course", desc: "Four courses: math, science, study skills and digital/money literacy." },
    { title: "Read the lesson", desc: "Short sections plus key points — no credits needed, all lessons are free." },
    { title: "Mark it complete", desc: "Each completed lesson adds 15 Education XP." },
    { title: "Pass the exercise", desc: "The quiz at the end adds 10 more XP and levels up your learning path." },
  ],
};

export default function EducationLessons() {
  const { data: progress = [] } = useHubLessonProgress();
  const { data: scores = [] } = useHubExerciseScores();

  const isDone = (c: string, l: string) => progress.some((p) => p.course_key === c && p.lesson_key === l);
  const scoreOf = (c: string, l: string) => scores.find((s) => s.course_key === c && s.lesson_key === l)?.score ?? null;
  const doneCount = progress.filter((p) => HUB_COURSES.some((c) => c.key === p.course_key)).length;

  return (
    <>
      <Helmet>
        <title>Lessons & Exercises · Education</title>
        <meta name="description" content="Free structured lessons with graded exercises — earn Education XP and climb your learning path." />
      </Helmet>
      <FloatingHowItWorks title={HIW.title} intro={HIW.intro} steps={HIW.steps} />

      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Lessons &amp; Exercises</h1>
          <p className="text-muted-foreground">
            {TOTAL_HUB_LESSONS} lessons across 4 courses. Every lesson gives 15 XP, every exercise 10 XP.
          </p>
        </motion.div>

        <Card className="mb-8 backdrop-blur-xl bg-card/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold">Curriculum progress</span>
              <span className="text-muted-foreground">{doneCount}/{TOTAL_HUB_LESSONS} lessons</span>
            </div>
            <Progress value={(doneCount / TOTAL_HUB_LESSONS) * 100} className="h-2" />
          </CardContent>
        </Card>

        <div className="space-y-8">
          {HUB_COURSES.map((course, ci) => {
            const done = course.lessons.filter((l) => isDone(course.key, l.key)).length;
            return (
              <motion.section
                key={course.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.05 }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">{course.title}</h2>
                  <Badge variant="outline">{done}/{course.lessons.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {course.lessons.map((l) => {
                    const complete = isDone(course.key, l.key);
                    const score = scoreOf(course.key, l.key);
                    return (
                      <Link key={l.key} to={`/education/lessons/${course.key}/${l.key}`}>
                        <Card className={`h-full hover:border-primary/40 hover:shadow-lg transition-all backdrop-blur-xl bg-card/80 ${complete ? "border-emerald-500/40" : ""}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2 mb-1">
                              <h3 className="font-bold text-sm flex-1">{l.title}</h3>
                              {complete && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{l.summary}</p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{l.minutes} min</span>
                              <Badge variant="secondary" className="text-[10px]">{l.quiz.length} questions</Badge>
                              {score !== null && (
                                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600">
                                  Quiz {score}%
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </>
  );
}
