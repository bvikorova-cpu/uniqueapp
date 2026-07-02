import { TeenModuleShell } from "@/components/teen/TeenModuleShell";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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

      <FloatingHowItWorks title="TeenMentalWellness — How it works" steps={[{title:"Open the tool",desc:"Launch TeenMentalWellness from the menu to access its features."},{title:"Explore options",desc:"Browse available cards, filters and personalized recommendations."},{title:"Interact & track",desc:"Log entries, start sessions or run AI scans. Some AI actions cost 3–5 credits."},{title:"Review progress",desc:"Check your dashboard for streaks, achievements and history."}]} />