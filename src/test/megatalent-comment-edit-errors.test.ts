/**
 * Megatalent comment edit — error message tests
 * ---------------------------------------------
 * Mirrors the exact branching used in TalentCommentsSheet.saveEdit to
 * verify the user gets a clear, actionable toast for every failure mode:
 *
 *  1. Not signed in                    → "Prihlásenie potrebné"
 *  2. Not the comment owner            → "Nemáš oprávnenie"
 *  3. RLS denial (no subscription /
 *     not owner enforced server-side)  → "Úprava zamietnutá"
 *  4. Expired JWT                      → "Relácia vypršala"
 *  5. Comment deleted / RLS silent
 *     filter (no row returned)         → "Úpravu sa nepodarilo uložiť"
 *  6. Generic network/DB error         → "Chyba pri ukladaní"
 *  7. Happy path                       → "Komentár upravený"
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
      title: "Neplatný komentár",
      description: "Komentár nemôže byť prázdny",
      variant: "destructive",
    });
    return { ok: false };
  }
  if (trimmed.length > MAX_LEN) {
    toast({
      title: "Neplatný komentár",
      description: "Komentár môže mať maximálne 500 znakov",
      variant: "destructive",
    });
    return { ok: false };
  }

  const target = comments.find((c) => c.id === editingId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Prihlásenie potrebné",
      description: "Pre úpravu komentára sa najprv prihlás.",
      variant: "destructive",
    });
    return { ok: false };
  }
  if (target && target.user_id !== user.id) {
    toast({
      title: "Nemáš oprávnenie",
      description: "Upraviť môžeš iba vlastné komentáre.",
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
          title: "Úprava zamietnutá",
          description:
            "Komentár vieš upraviť len ako jeho autor a s aktívnym Megatalent predplatným. Skontroluj svoje predplatné a skús to znova.",
          variant: "destructive",
        });
      } else if (msg.includes("jwt") || msg.includes("not authenticated")) {
        toast({
          title: "Relácia vypršala",
          description: "Prihlás sa znova a skús úpravu zopakovať.",
          variant: "destructive",
        });
      } else {
        throw error;
      }
      return { ok: false };
    }

    if (!data) {
      toast({
        title: "Úpravu sa nepodarilo uložiť",
        description:
          "Pravdepodobne nemáš aktívne Megatalent predplatné, alebo bol komentár medzitým odstránený.",
        variant: "destructive",
      });
      return { ok: false };
    }

    toast({ title: "Komentár upravený" });
    return { ok: true };
  } catch (err: any) {
    toast({
      title: "Chyba pri ukladaní",
      description: err?.message || "Nepodarilo sa upraviť komentár. Skús to prosím znova.",
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
  comment_text: "Pôvodný text",
};
const othersComment: LocalComment = {
  id: "c-2",
  user_id: "user-other",
  comment_text: "Cudzí komentár",
};

beforeEach(() => {
  toastSpy.mockReset();
  supabaseState.user = { id: "user-self" };
  supabaseState.updateResult = { data: null, error: null };
});

describe("Megatalent — saveEdit error messaging", () => {
  it("shows 'Prihlásenie potrebné' when the user is signed out", async () => {
    supabaseState.user = null;
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "Nový text",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Prihlásenie potrebné",
        variant: "destructive",
      })
    );
  });

  it("shows 'Nemáš oprávnenie' when editing someone else's comment", async () => {
    const res = await saveEdit({
      editingId: othersComment.id,
      editingText: "Pokus o úpravu",
      comments: [othersComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nemáš oprávnenie",
        description: expect.stringContaining("vlastné komentáre"),
        variant: "destructive",
      })
    );
  });

  it("shows 'Úprava zamietnutá' on RLS denial (e.g. missing subscription)", async () => {
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
        title: "Úprava zamietnutá",
        description: expect.stringContaining("Megatalent predplatným"),
        variant: "destructive",
      })
    );
  });

  it("shows 'Relácia vypršala' on JWT auth error", async () => {
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
        title: "Relácia vypršala",
        variant: "destructive",
      })
    );
  });

  it("shows 'Úpravu sa nepodarilo uložiť' when no row is returned (deleted / RLS silent filter)", async () => {
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
        title: "Úpravu sa nepodarilo uložiť",
        description: expect.stringContaining("predplatné"),
        variant: "destructive",
      })
    );
  });

  it("shows generic 'Chyba pri ukladaní' on unknown DB error", async () => {
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
        title: "Chyba pri ukladaní",
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
        title: "Neplatný komentár",
        description: expect.stringContaining("prázdny"),
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
        title: "Neplatný komentár",
        description: expect.stringContaining("500"),
      })
    );
  });

  it("succeeds with 'Komentár upravený' on the happy path", async () => {
    supabaseState.updateResult = {
      data: { id: ownComment.id, comment_text: "Nový text", updated_at: new Date().toISOString() },
      error: null,
    };
    const res = await saveEdit({
      editingId: ownComment.id,
      editingText: "Nový text",
      comments: [ownComment],
      supabase: supabaseMock,
      toast: toastSpy,
    });
    expect(res.ok).toBe(true);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Komentár upravený" })
    );
    // success toast must NOT use the destructive variant
    const successCall = toastSpy.mock.calls.find(
      ([c]) => c.title === "Komentár upravený"
    );
    expect(successCall?.[0].variant).toBeUndefined();
  });
});
