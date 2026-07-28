import { supabase } from "@/integrations/supabase/client";

/**
 * Central logger for Kids Channel activity so the Parental Dashboard
 * always reflects real usage (instead of empty/placeholder stats).
 * Failures are swallowed — logging must never break a kid's flow.
 */

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function logKidsHomework(params: {
  subject: string;
  question: string;
  aiExplanation?: string | null;
  difficulty?: string | null;
}) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    await (supabase as any).from("kids_homework").insert({
      user_id: userId,
      subject: params.subject || "general",
      question: (params.question || "").slice(0, 2000),
      ai_explanation: params.aiExplanation ? String(params.aiExplanation).slice(0, 8000) : null,
      difficulty_level: params.difficulty ?? null,
    });
  } catch (e) {
    console.warn("logKidsHomework failed", e);
  }
}

export async function logKidsScienceExperiment(params: {
  name: string;
  category: string;
  hypothesis?: string | null;
  observations?: string | null;
  conclusion?: string | null;
  completed?: boolean;
}) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    await (supabase as any).from("kids_science_experiments").insert({
      user_id: userId,
      experiment_name: params.name || "Experiment",
      category: params.category || "general",
      hypothesis: params.hypothesis ?? null,
      observations: params.observations ?? null,
      conclusion: params.conclusion ?? null,
      completed: params.completed ?? true,
    });
  } catch (e) {
    console.warn("logKidsScienceExperiment failed", e);
  }
}

export async function logKidsReadingSession(params: {
  bookTitle: string;
  content: string;
  comprehensionScore?: number | null;
  vocabulary?: unknown[];
  completed?: boolean;
}) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    await (supabase as any).from("kids_reading_sessions").insert({
      user_id: userId,
      book_title: (params.bookTitle || "Reading session").slice(0, 200),
      content: (params.content || "").slice(0, 8000),
      comprehension_score: params.comprehensionScore ?? null,
      vocabulary_learned: params.vocabulary ?? [],
      completed: params.completed ?? false,
    });
  } catch (e) {
    console.warn("logKidsReadingSession failed", e);
  }
}

export async function logKidsStory(params: {
  title: string;
  storyText: string;
  illustrationUrl?: string | null;
  characters?: unknown;
  theme?: string | null;
  category?: string | null;
}) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    await (supabase as any).from("kids_stories").insert({
      user_id: userId,
      title: (params.title || "My story").slice(0, 200),
      story_text: (params.storyText || "").slice(0, 20000),
      illustration_url: params.illustrationUrl ?? null,
      characters: Array.isArray(params.characters)
        ? params.characters
        : params.characters
          ? [params.characters]
          : [],
      theme: params.theme ?? null,
      category: params.category ?? "adventure",
    });
  } catch (e) {
    console.warn("logKidsStory failed", e);
  }
}
