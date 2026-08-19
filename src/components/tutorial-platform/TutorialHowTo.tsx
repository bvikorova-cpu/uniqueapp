import { GraduationCap, Sparkles, BadgeCheck, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LEARN_STEPS = [
  "Open Browse Courses and pick a course.",
  "Send an access request (3 credits). You pay the creator directly, outside the platform.",
  "Watch lessons and complete quizzes in My Learning.",
  "Finish all lessons and issue your certificate for 3 credits (PDF + share image).",
];

const CREATE_STEPS = [
  "Open Create Course and add modules, lessons, videos and files.",
  "Add a quiz to any lesson so students can test themselves.",
  "Publish your course for 15 credits.",
  "Approve access requests in My Courses and agree the price with the student.",
];

export function TutorialHowTo() {
  return (
    <Card className="mb-10 overflow-hidden border-primary/15 bg-card/60 backdrop-blur-xl">
      <CardContent className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-black tracking-tight md:text-xl">How this section works</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <GraduationCap className="h-4 w-4 text-primary" /> For students
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {LEARN_STEPS.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <BadgeCheck className="h-4 w-4 text-primary" /> For creators
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {CREATE_STEPS.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <Coins className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm font-semibold text-foreground">
            100% of every course sale belongs to the seller. The platform takes no commission from course
            prices — payment is arranged directly between the creator and the student.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
