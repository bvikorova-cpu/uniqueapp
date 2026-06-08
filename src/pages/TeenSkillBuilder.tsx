import { TeenModuleShell } from "@/components/teen/TeenModuleShell";

export default function TeenSkillBuilder() {
  return (
    <TeenModuleShell
      module="skill_builder"
      title="Skill Builder"
      emoji="🚀"
      description="4-week skill roadmaps with daily 30-min tasks and free resources."
      placeholder="What skill do you want to learn? (e.g. video editing, Python, guitar...)"
      examples={[
        "Learn Python basics",
        "Get started with video editing",
        "Improve at chess",
      ]}
    />
  );
}
