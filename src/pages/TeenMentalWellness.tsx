import { TeenModuleShell } from "@/components/teen/TeenModuleShell";

export default function TeenMentalWellness() {
  return (
    <TeenModuleShell
      module="mental_wellness"
      title="Mental Wellness"
      emoji="🌱"
      description="Journaling prompts, breathing exercises, and reframing techniques. Not medical advice."
      placeholder="How are you feeling? What's on your mind today?"
      examples={[
        "I feel anxious about exams",
        "Give me a 5-minute breathing exercise",
        "Help me journal about a tough day",
      ]}
    />
  );
}
