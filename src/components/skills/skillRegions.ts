// Country-neutral, structured service ranges used across the Skills Marketplace.
export const SKILL_REGIONS = [
  { value: "remote", label: "Online / Remote" },
  { value: "city", label: "In my city" },
  { value: "nearby", label: "City + surrounding area" },
  { value: "wide", label: "Willing to travel far" },
] as const;

export type SkillRegion = (typeof SKILL_REGIONS)[number]["value"];

export const regionLabel = (value?: string | null) =>
  SKILL_REGIONS.find((r) => r.value === value)?.label ?? null;
