import { TeenModuleShell } from "@/components/teen/TeenModuleShell";

export default function TeenSocialCoach() {
  return (
    <TeenModuleShell
      module="social_coach"
      title="Social Coach"
      emoji="💬"
      description="Practical scripts and role-play for friendship, conflict, dating boundaries, and public speaking."
      placeholder="Describe the social situation you'd like help with..."
      examples={[
        "How to apologize to a friend",
        "Saying no to peer pressure",
        "Starting a conversation with someone new",
      ]}
    />
  );
}
