import { supabase } from "@/integrations/supabase/client";

export const MEGATALENT_PENDING_SUBMISSION_KEY = "unique-megatalent-pending-submission-v1";
const DRAFT_KIND = "megatalent_submission";

export interface PendingMegatalentSubmission {
  userId: string;
  title: string;
  description: string;
  category: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
}

function isValidDraft(draft: Partial<PendingMegatalentSubmission> | null, userId?: string): boolean {
  if (!draft) return false;
  if (userId && draft.userId !== userId) return false;
  return (
    typeof draft.title === "string" &&
    typeof draft.description === "string" &&
    typeof draft.category === "string" &&
    typeof draft.mediaUrl === "string" &&
    (draft.mediaType === "image" || draft.mediaType === "video") &&
    typeof draft.createdAt === "string"
  );
}

export function savePendingMegatalentSubmission(draft: PendingMegatalentSubmission) {
  try {
    window.localStorage.setItem(MEGATALENT_PENDING_SUBMISSION_KEY, JSON.stringify(draft));
  } catch {
    /* storage may be unavailable (private mode) — the DB copy below is the source of truth */
  }
  // Durable copy so the draft survives a Stripe redirect, a different tab,
  // a cleared browser storage or a switch of device.
  void supabase
    .from("post_drafts")
    .upsert(
      {
        user_id: draft.userId,
        content: draft.title,
        media_urls: [draft.mediaUrl],
        draft_data: { kind: DRAFT_KIND, ...draft } as unknown as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,content" },
    )
    .then(({ error }) => {
      if (error) {
        // Fall back to a plain insert when no matching unique index exists.
        void supabase.from("post_drafts").insert({
          user_id: draft.userId,
          content: draft.title,
          media_urls: [draft.mediaUrl],
          draft_data: { kind: DRAFT_KIND, ...draft } as unknown as never,
        });
      }
    });
}

export function readPendingMegatalentSubmission(userId: string): PendingMegatalentSubmission | null {
  try {
    const raw = window.localStorage.getItem(MEGATALENT_PENDING_SUBMISSION_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<PendingMegatalentSubmission>;
    return isValidDraft(draft, userId) ? (draft as PendingMegatalentSubmission) : null;
  } catch {
    return null;
  }
}

/**
 * Local draft first, then the durable database copy. Used on return from
 * Stripe so a pending submission is published even if browser storage lost it.
 */
export async function loadPendingMegatalentSubmission(
  userId: string,
): Promise<PendingMegatalentSubmission | null> {
  const local = readPendingMegatalentSubmission(userId);
  if (local) return local;

  const { data } = await supabase
    .from("post_drafts")
    .select("draft_data")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  for (const row of data ?? []) {
    const payload = row.draft_data as unknown as (Partial<PendingMegatalentSubmission> & { kind?: string }) | null;
    if (payload?.kind === DRAFT_KIND && isValidDraft(payload, userId)) {
      return payload as PendingMegatalentSubmission;
    }
  }
  return null;
}

export function clearPendingMegatalentSubmission(userId?: string) {
  try {
    window.localStorage.removeItem(MEGATALENT_PENDING_SUBMISSION_KEY);
  } catch {
    /* ignore */
  }
  if (!userId) return;
  void supabase
    .from("post_drafts")
    .delete()
    .eq("user_id", userId)
    .contains("draft_data", { kind: DRAFT_KIND } as unknown as never);
}
