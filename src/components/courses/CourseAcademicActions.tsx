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

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={() => setShowCurr(true)} className="flex-1 min-w-[140px]">
          <BookOpen className="w-4 h-4 mr-1" /> View Curriculum
        </Button>
        <Button
          size="sm"
          variant={unlocked ? "default" : "secondary"}
          disabled={!unlocked}
          onClick={() => setShowExam(true)}
          className="flex-1 min-w-[140px]"
          title={unlocked ? "Take final exam" : "Enroll to unlock the final exam"}
        >
          <GraduationCap className="w-4 h-4 mr-1" /> {unlocked ? "Final Exam" : "Exam locked"}
        </Button>
      </div>

      <CourseCurriculumDialog
        open={showCurr}
        onOpenChange={setShowCurr}
        meta={meta}
        onTakeExam={unlocked ? () => setShowExam(true) : undefined}
      />
      <FinalExamDialog open={showExam} onOpenChange={setShowExam} meta={meta} />
    </>
  );
};
