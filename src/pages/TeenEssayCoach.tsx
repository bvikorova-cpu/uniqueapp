import { TeenModuleShell } from "@/components/teen/TeenModuleShell";

export default function TeenEssayCoach() {
  return (
    <TeenModuleShell
      module="essay_coach"
      title="Essay Coach"
      emoji="✍️"
      description="Get structured feedback on essays: thesis, evidence, transitions, grammar, and score."
      placeholder="Paste your essay draft (max 4000 chars)..."
      examples={[
        "Review my college application essay",
        "Improve my opening paragraph",
      ]}
    />
  );
}
