/**
 * Shared helpers for routing inside the Fundraising section.
 * Eliminates the previous bug where every campaign tile linked to
 * `/fundraising/medical/[id]` regardless of category.
 */

export const FUNDRAISING_CATEGORIES = [
  { type: "medical",  label: "Medical",  emoji: "🏥" },
  { type: "dream",    label: "Dream",    emoji: "✨" },
  { type: "hero",     label: "Hero",     emoji: "🦸" },
  { type: "pet",      label: "Pet",      emoji: "🐾" },
  { type: "student",  label: "Student",  emoji: "🎓" },
  { type: "crisis",   label: "Crisis",   emoji: "🆘" },
  { type: "talent",   label: "Talent",   emoji: "🎭" },
] as const;

export type FundraisingCategory = (typeof FUNDRAISING_CATEGORIES)[number]["type"];

const CAMPAIGN_TABLE_TO_TYPE: Record<string, FundraisingCategory> = {
  medical_campaigns:     "medical",
  dream_campaigns:       "dream",
  hero_campaigns:        "hero",
  pet_rescue_campaigns:  "pet",
  student_campaigns:     "student",
  crisis_campaigns:      "crisis",
  talent_campaigns:      "talent",
};

export function tableToCategory(table: string): FundraisingCategory {
  return CAMPAIGN_TABLE_TO_TYPE[table] ?? "medical";
}

export function campaignDetailRoute(type: string, id: string): string {
  return `/fundraising/${type}/${id}`;
}

export function campaignDashboardRoute(type: string, id: string): string {
  return `/fundraising/${type}/${id}/dashboard`;
}

export function campaignCreateRoute(type: string): string {
  return `/fundraising/${type}/create`;
}
