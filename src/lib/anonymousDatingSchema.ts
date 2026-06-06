import { z } from "zod";

// Shared Zod schema for Anonymous Dating profile. Mirrors edge-function
// safety caps used in supabase/functions/_shared/anonymous-dating.ts.
export const ANON_DATING_NAME_MAX = 40;
export const ANON_DATING_LOOKING_FOR_MAX = 500;
export const ANON_DATING_LOCATION_MAX = 80;
export const ANON_DATING_MIN_INTERESTS = 3;
export const ANON_DATING_MAX_INTERESTS = 12;
export const ANON_DATING_MAX_TRAITS = 5;
export const ANON_DATING_MAX_LANGUAGES = 8;

export const AGE_RANGE_PATTERN = /^\d{2}-\d{2}$/;

export const anonymousDatingProfileSchema = z
  .object({
    anonymous_name: z
      .string()
      .trim()
      .min(3, "Anonymous name must be at least 3 characters")
      .max(ANON_DATING_NAME_MAX, `Anonymous name must be at most ${ANON_DATING_NAME_MAX} characters`)
      .regex(/^[a-zA-Z0-9_.\-\s]+$/, "Only letters, numbers, spaces, _ . - are allowed"),
    age_range: z
      .string()
      .trim()
      .regex(AGE_RANGE_PATTERN, "Use format like 25-30"),
    looking_for: z.string().trim().max(ANON_DATING_LOOKING_FOR_MAX).optional().or(z.literal("")),
    location: z.string().trim().max(ANON_DATING_LOCATION_MAX).optional().or(z.literal("")),
    gender: z.enum(["Male", "Female", "Non-binary", "Other"]).optional().or(z.literal("")),
    preferred_gender: z.enum(["Male", "Female", "Any"]).optional().or(z.literal("")),
    relationship_goal: z
      .enum(["friendship", "casual", "serious", "marriage"])
      .optional()
      .or(z.literal("")),
    languages: z.array(z.string().trim().min(1)).max(ANON_DATING_MAX_LANGUAGES).default([]),
    interests: z
      .array(z.string().trim().min(1))
      .min(ANON_DATING_MIN_INTERESTS, `Select at least ${ANON_DATING_MIN_INTERESTS} interests`)
      .max(ANON_DATING_MAX_INTERESTS),
    personality_traits: z.array(z.string().trim().min(1)).max(ANON_DATING_MAX_TRAITS),
  })
  .superRefine((val, ctx) => {
    const [lo, hi] = val.age_range.split("-").map(Number);
    if (Number.isFinite(lo) && Number.isFinite(hi)) {
      if (lo < 16) ctx.addIssue({ code: "custom", path: ["age_range"], message: "Minimum age is 16" });
      if (hi < lo) ctx.addIssue({ code: "custom", path: ["age_range"], message: "Upper bound must be ≥ lower bound" });
      if (hi - lo > 20) ctx.addIssue({ code: "custom", path: ["age_range"], message: "Age range too wide (max 20 years)" });
    }
  });

export type AnonymousDatingProfileInput = z.infer<typeof anonymousDatingProfileSchema>;
