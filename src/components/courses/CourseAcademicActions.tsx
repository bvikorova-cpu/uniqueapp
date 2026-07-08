import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap } from "lucide-react";
import { CourseCurriculumDialog } from "./CourseCurriculumDialog";
import { FinalExamDialog } from "./FinalExamDialog";
import type { CourseMetaLite } from "@/lib/moduleCourseApi";

interface Props {
  meta: CourseMetaLite;
  unlocked: boolean;
}

export const CourseAcademicActions = ({ meta, unlocked }: Props) => {
  const [showCurr, setShowCurr] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [ready, setReady] = useState(false);

  const canExam = unlocked && ready;

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={() => setShowCurr(true)} className="flex-1 min-w-[140px]">
          <BookOpen className="w-4 h-4 mr-1" /> {unlocked ? "Curriculum & Lessons" : "View Curriculum"}
        </Button>
        <Button
          size="sm"
          variant={canExam ? "default" : "secondary"}
          disabled={!canExam}
          onClick={() => setShowExam(true)}
          className="flex-1 min-w-[140px]"
          title={
            !unlocked
              ? "Enroll to access lessons"
              : !ready
              ? "Complete 80% of lessons to unlock the final exam"
              : "Take final exam"
          }
        >
          <GraduationCap className="w-4 h-4 mr-1" />
          {!unlocked ? "Exam locked" : !ready ? "Complete lessons first" : "Final Exam"}
        </Button>
      </div>

      <CourseCurriculumDialog
        open={showCurr}
        onOpenChange={setShowCurr}
        meta={meta}
        purchased={unlocked}
        onTakeExam={canExam ? () => setShowExam(true) : undefined}
        onReadyChange={setReady}
      />
      <FinalExamDialog open={showExam} onOpenChange={setShowExam} meta={meta} />
    </>
  );
};
