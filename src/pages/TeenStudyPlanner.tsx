import { TeenModuleShell } from "@/components/teen/TeenModuleShell";

export default function TeenStudyPlanner() {
  return (
    <TeenModuleShell
      module="study_planner"
      title="Study Planner"
      emoji="📅"
      description="Personalized weekly study plans with Pomodoro blocks and revision checkpoints."
      placeholder="List your subjects, exams, and free hours per day..."
      examples={[
        "Build a plan for my finals in 2 weeks",
        "Weekly schedule for math + biology + history",
      ]}
    />
  );
}
