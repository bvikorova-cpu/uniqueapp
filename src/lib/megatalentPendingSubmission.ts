export const MEGATALENT_PENDING_SUBMISSION_KEY = "unique-megatalent-pending-submission-v1";

export interface PendingMegatalentSubmission {
  userId: string;
  title: string;
  description: string;
  category: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
}

export function savePendingMegatalentSubmission(draft: PendingMegatalentSubmission) {
  window.localStorage.setItem(MEGATALENT_PENDING_SUBMISSION_KEY, JSON.stringify(draft));
}

export function readPendingMegatalentSubmission(userId: string): PendingMegatalentSubmission | null {
  try {
    const raw = window.localStorage.getItem(MEGATALENT_PENDING_SUBMISSION_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<PendingMegatalentSubmission>;
    if (
      draft.userId !== userId ||
      typeof draft.title !== "string" ||
      typeof draft.description !== "string" ||
      typeof draft.category !== "string" ||
      typeof draft.mediaUrl !== "string" ||
      (draft.mediaType !== "image" && draft.mediaType !== "video") ||
      typeof draft.createdAt !== "string"
    ) return null;
    return draft as PendingMegatalentSubmission;
  } catch {
    return null;
  }
}

export function clearPendingMegatalentSubmission() {
  window.localStorage.removeItem(MEGATALENT_PENDING_SUBMISSION_KEY);
}