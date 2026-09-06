/**
 * Human-readable labels for raw ai_usage_history.usage_type / credit_payments.credit_type keys.
 * Falls back to a prettified version of the raw key so new tools still read well.
 */
const LABELS: Record<string, string> = {
  image_generation: "Image generation",
  custom_generation: "Custom generation",
  effect: "Style transfer",
  avatar: "Avatar",
  course: "AI mentor",
  mystery_box_purchase: "Mystery box",
  mystery_box_ai: "Mystery box AI",
  lucky_wheel_spin: "Lucky wheel",
  character_image: "Character image",
  coloring_page_generation: "Coloring page",
  gift_credits: "Gifted credits",
  gift_message: "Gift message",
  mentor_voice_coaching: "AI coaching",
  teen_career_credits: "Teen career",
  homework_credits: "Homework helper",
  story_generation: "Story generator",
  brain_duel: "Brain Duel",
  one_off: "One-off",
};

export function prettifyUsageType(raw?: string | null): string {
  if (!raw) return "Other";
  const key = String(raw).toLowerCase();
  if (LABELS[key]) return LABELS[key];
  const cleaned = key.replace(/[_-]+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
