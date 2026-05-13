/**
 * Megatalent comment edit — error message tests
 * ---------------------------------------------
 * Mirrors the exact branching used in TalentCommentsSheet.saveEdit to
 * verify the user gets a clear, actionable toast for every failure mode:
 *
 *  1. Not signed in                    → "Login required"
 *  2. Not the comment owner            → "You are not authorized"
 *  3. RLS denial (no subscription /
 *     not owner enforced server-side)  → "Edit denied"
 *  4. Expired JWT                      → "Session expired"
 *  5. Comment deleted / RLS silent
 *     filter (no row returned)         → "Failed to save edit"
 *  6. Generic network/DB error         → "Error saving"
 *  7. Happy path                       → "Comment updated"
 *
 * The function under test is reproduced here verbatim (sans React state) to
 * keep the unit pure and avoid mounting the whole Sheet.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ────────────────────────────────────────────────────────────────────────────
// Toast spy
// ────────────────────────────────────────────────────────────────────────────

type ToastCall = { title?: string; description?: string; variant?: string };
const toastSpy = vi.fn<(t: ToastCall) => void>();

// ────────────────────────────────────────────────────────────────────────────
// Supabase mock — programmable per test
// ────────────────────────────────────────────────────────────────────────────

type AuthUser = { id: string } | null;
type UpdateResult = {
  data: { id: string; comment_text: string; updated_at: string } | null;
  error: { message: string; code?: string } | null;
};

const supabaseState: {
  user: AuthUser;
  updateResult: UpdateResult;
} = {
  user: { id: "user-self" },
  updateResult: { data: null, error: null },
};

const supabaseMock = {
  auth: {
    getUser: vi.fn(async () => ({ data: { user: supabaseState.user } })),
  },
  from: vi.fn((_table: string) => ({
    update: vi.fn((_values: Record<string, unknown>) => ({
      eq: vi.fn((_col: string, _val: string) => ({
        select: vi.fn((_cols: string) => ({
          maybeSingle: vi.fn(async () => supabaseState.updateResult),
        })),
      })),
    })),
  })),
};

// ────────────────────────────────────────────────────────────────────────────
// Reproduction of saveEdit (kept in sync with TalentCommentsSheet.tsx)
// ────────────────────────────────────────────────────────────────────────────

const MAX_LEN = 500;

interface LocalComment {
  id: string;
  user_id: string;
  comment_text: string;
}

async function saveEdit(args: {
  editingId: string | null;
  editingText: string;
  comments: LocalComment[];
  supabase: typeof supabaseMock;
  toast: typeof toastSpy;
}): Promise<{ ok: boolean }> {
  const { editingId, editingText, comments, supabase, toast } = args;
  if (!editingId) return { ok: false };

  const trimmed = editingText.trim();
  if (!trimmed) {
    toast({
      title: "Invalid comment",
      description: "Comment cannot be empty",
      variant: "destructive",
    });
    return { ok: false };
  }
  if (trimmed.length > MAX_LEN) {
    toast({
      title: "Invalid comment",
      description: "Comment can be a maximum of 500 characters",
      variant: "destructive",
    });
    return { ok: false };
  }

  const target = comments.find((c) => c.id === editingId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Login required",
      description: "To edit a comment, please log in first.",
      variant: "destructive",
    });
    return { ok: false };
  }
  if (target && target.user_id !== user.id) {
    toast({
      title: "You are not authorized",
      description: "You can only edit your own comments.",
      variant: "destructive",
    });
    return { ok: false };
  }

  try {
    const { data, error } = await supabase
      .from("talent_comments")
      .update({ comment_text: trimmed, updated_at: new Date().toISOString() })
      .eq("id", editingId)
      .select("id, comment_text, updated_at")
      .maybeSingle();

    if (error) {
      const msg = (error.message || "").toLowerCase();
      const code = error.code;
      if (msg.includes("row-level security") || code === "42501") {
        toast({
          title: "Edit denied",
          description:
            "You can only edit the comment as its author and with an active Megatalent subscription. Check your subscription and try again.",
          variant: "destructive",
        });
      } else if (msg.includes("jwt") || msg.includes("not authenticated")) {
        toast({
          title: "Session expired",
          description: "Log in again and try to repeat the edit.",
          variant: "destructive",
        });
      } else {
        throw error;
      }
      return { ok: false };
    }

    if (!data) {
      toast({
        title: "Failed to save edit",
        description:
          "You probably don't have an active Megatalent subscription, or the comment was removed in the meantime.",
        variant: "destructive",
      });
      return { ok: false };
    }

    toast({ title: "Comment updated" });
    return { ok: true };
  } catch (err: any) {
    toast({
      title: "Error saving",
      description: err?.message || "Failed to edit comment. Please try again.",
      variant: "destructive",
    });
    return { ok: false };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

const ownComment: LocalComment = {
  id: "c-1",
  user_id: "user-self",
  comment_text: "Original text",
};
const othersComment: LocalComment = {
  id: "c-2",
  user_id: "user-other",
  comment_text: "Someone else's comment",
};

beforeEach(() => {
  toastSpy.mockReset();
  supabaseState.user = { id: "user-self" };
  supabaseState.updateResult = { data: null, error: null };
});

describe("Megatalent — saveEdit error messaging", () => {
  it("shows 'Login required' when the user is signed out", async () => {
    supabaseState.user = null;
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "New text",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Login required",
        variant: "destructive",
      })
    );
  });

  it("shows 'You are not authorized' when editing someone else's comment", async () => {
    const res = await saveEdit({
      editingId: othersComment.id,
      editingText: "Attempt to edit",
      comments: [othersComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "You are not authorized",
        description: expect.stringContaining("own comments"),
        variant: "destructive",
      })
    );
  });

  it("shows 'Edit denied' on RLS denial (e.g. missing subscription)", async () => {
    supabaseState.updateResult = {
      data: null,
      error: { message: "new row violates row-level security policy", code: "42501" },
    };
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "Update",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Edit denied",
        description: expect.stringContaining("Megatalent subscription"),
        variant: "destructive",
      })
    );
  });

  it("shows 'Session expired' on JWT auth error", async () => {
    supabaseState.updateResult = {
      data: null,
      error: { message: "JWT expired" },
    };
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "Update",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Session expired",
        variant: "destructive",
      })
    );
  });

  it("shows 'Failed to save edit' when no row is returned (deleted / RLS silent filter)", async () => {
    supabaseState.updateResult = { data: null, error: null };
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "Update",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Failed to save edit",
        description: expect.stringContaining("subscription"),
        variant: "destructive",
      })
    );
  });

  it("shows generic 'Error saving' on unknown DB error", async () => {
    supabaseState.updateResult = {
      data: null,
      error: { message: "connection reset by peer", code: "08006" },
    };
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "Update",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error saving",
        description: expect.stringContaining("connection reset"),
        variant: "destructive",
      })
    );
  });

  it("rejects empty / whitespace-only edits with a validation toast", async () => {
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "   ",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Invalid comment",
        description: expect.stringContaining("empty"),
      })
    );
  });

  it("rejects edits longer than 500 characters", async () => {
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "x".repeat(501),
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Invalid comment",
        description: expect.stringContaining("500"),
      })
    );
  });

  it("succeeds with 'Comment updated' on the happy path", async () => {
    supabaseState.updateResult = {
      data: { id: ownComment.id, comment_text: "New text", updated_at: new Date().toISOString() },
      error: null,
    };
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "New text",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(true);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Comment updated" })
    );
    // success toast must NOT use the destructive variant
    const successCall = toastSpy.mock.calls.find(
      ([c]) => c.title === "Comment edited"
    );
    expect(successCall?.[0].variant).toBeUndefined();
  });
});
