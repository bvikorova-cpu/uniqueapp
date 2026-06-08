import { TeenModuleShell } from "@/components/teen/TeenModuleShell";

export default function TeenHomeworkPro() {
  return (
    <TeenModuleShell
      module="homework_pro"
      title="Homework Pro"
      emoji="📘"
      description="Step-by-step explanations for high-school math, science, history, and languages."
      placeholder="Paste your problem or question here..."
      examples={[
        "Solve x² − 5x + 6 = 0",
        "Explain photosynthesis",
        "Translate to Spanish: 'I went to the store yesterday'",
      ]}
    />
  );
}
