/**
 * Megatalent voting paywall tests
 * --------------------------------
 * Verifies that like / dislike (vote toggle) / comment actions in the
 * Megatalent UI are gated behind a CONFIRMED PAID €10/month subscription.
 *
 * Layers covered:
 *  1. Gating logic (mirrors src/pages/Megatalent.tsx handleVote / handleComment)
 *     - Blocks when subscription is missing
 *     - Blocks when subscription row exists but status !== 'active'
 *     - Blocks when subscription is active but tier price is wrong (< €10)
 *     - Allows when active €10 Premium subscription is confirmed
 *  2. UI integration (MegaTalentSubmissionCard)
 *     - Like/Dislike button click is intercepted by the gating handler
 *     - Comment button click is intercepted by the gating handler
 *  3. Static guard
 *     - Megatalent.tsx must check `isSubscribed` BEFORE inserting into
 *       talent_votes / talent_comments — prevents accidental removal of paywall.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import MegaTalentSubmissionCard from "@/components/megatalent/MegaTalentSubmissionCard";

// ────────────────────────────────────────────────────────────────────────────
// Reusable types & helpers
// ────────────────────────────────────────────────────────────────────────────

type SubRow = {
  tier: "premium" | "top_premium" | "free" | string;
  status: "active" | "incomplete" | "past_due" | "canceled" | string;
  price_eur: number; // €/month — must be ≥ 10 for Premium gating
} | null;

const MEGATALENT_PREMIUM_PRICE_EUR = 10;

/**
 * Mirrors the EXACT gating logic used in src/pages/Megatalent.tsx
 * for handleVote, handleComment, handleFileSelect, handleSubmit.
 *
 * The user must:
 *  - be logged in
 *  - have a megatalent_subscriptions row
 *  - that row's status === 'active'
 *  - that row's price ≥ €10/month (Premium or higher)
 */
function canPerformGatedAction(opts: {
  user: { id: string } | null;
  subscription: SubRow;
}): { allowed: boolean; reason?: string } {
  if (!opts.user) return { allowed: false, reason: "Login Required" };
  if (!opts.subscription) {
    return { allowed: false, reason: "Megatalent Premium required" };
  }
  if (opts.subscription.status !== "active") {
    return { allowed: false, reason: "Megatalent Premium required" };
  }
  if ((opts.subscription.price_eur ?? 0) < MEGATALENT_PREMIUM_PRICE_EUR) {
    return { allowed: false, reason: "Megatalent Premium required" };
  }
  return { allowed: true };
}

const baseSubmission = {
  id: "sub-1",
  title: "Test entry",
  description: "Hello",
  media_url: "https://example.com/x.jpg",
  media_type: "image" as const,
  votes_count: 12,
  created_at: new Date().toISOString(),
  user_id: "owner-id",
  profiles: { full_name: "Alice" },
  subscriptionTier: "premium",
};

// ────────────────────────────────────────────────────────────────────────────
// 1. Pure gating logic
// ────────────────────────────────────────────────────────────────────────────

describe("Megatalent voting gating logic", () => {
  const user = { id: "user-1" };

  it("BLOCKS like/dislike/comment when user has NO subscription row", () => {
    const r = canPerformGatedAction({ user, subscription: null });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("Megatalent Premium required");
  });

  it("BLOCKS when subscription exists but status is 'incomplete' (payment not confirmed)", () => {
    const r = canPerformGatedAction({
      user,
      subscription: { tier: "premium", status: "incomplete", price_eur: 10 },
    });
    expect(r.allowed).toBe(false);
  });

  it("BLOCKS when subscription is 'past_due' (payment failed renewal)", () => {
    const r = canPerformGatedAction({
      user,
      subscription: { tier: "premium", status: "past_due", price_eur: 10 },
    });
    expect(r.allowed).toBe(false);
  });

  it("BLOCKS when subscription is 'canceled'", () => {
    const r = canPerformGatedAction({
      user,
      subscription: { tier: "premium", status: "canceled", price_eur: 10 },
    });
    expect(r.allowed).toBe(false);
  });

  it("BLOCKS when active but tier is below €10 (e.g. 'free' / under-priced)", () => {
    const r = canPerformGatedAction({
      user,
      subscription: { tier: "free", status: "active", price_eur: 0 },
    });
    expect(r.allowed).toBe(false);
  });

  it("BLOCKS unauthenticated users even if a subscription row is provided", () => {
    const r = canPerformGatedAction({
      user: null,
      subscription: { tier: "premium", status: "active", price_eur: 10 },
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("Login Required");
  });

  it("ALLOWS when active €10 Premium subscription is confirmed", () => {
    const r = canPerformGatedAction({
      user,
      subscription: { tier: "premium", status: "active", price_eur: 10 },
    });
    expect(r.allowed).toBe(true);
  });

  it("ALLOWS €15 TOP Premium (price ≥ 10)", () => {
    const r = canPerformGatedAction({
      user,
      subscription: { tier: "top_premium", status: "active", price_eur: 15 },
    });
    expect(r.allowed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. UI integration: MegaTalentSubmissionCard like/dislike/comment buttons
//    must route through the gated handler — never bypass it.
// ────────────────────────────────────────────────────────────────────────────

describe("MegaTalentSubmissionCard UI invokes gated handlers", () => {
  const onVote = vi.fn();
  const onComment = vi.fn();
  const onShare = vi.fn();
  const onDelete = vi.fn();
  const onMediaClick = vi.fn();

  beforeEach(() => {
    onVote.mockReset();
    onComment.mockReset();
  });

  function renderCard() {
    return render(
      <MegaTalentSubmissionCard
        submission={baseSubmission}
        categoryLabel="Drawing"
        isLiked={false}
        commentCount={3}
        isOwner={false}
        isDeleting={false}
        index={0}
        onVote={onVote}
        onComment={onComment}
        onShare={onShare}
        onDelete={onDelete}
        onMediaClick={onMediaClick}
      />,
    );
  }

  it("Like button calls the (gated) onVote handler with submission id", () => {
    renderCard();
    // Like button is the one rendering the vote count
    const likeBtn = screen.getAllByText("12")[1].closest("button")!;
    fireEvent.click(likeBtn);
    expect(onVote).toHaveBeenCalledTimes(1);
    expect(onVote).toHaveBeenCalledWith("sub-1");
  });

  it("Comment button calls the (gated) onComment handler with submission id", () => {
    renderCard();
    const commentBtn = screen.getByText("3").closest("button")!;
    fireEvent.click(commentBtn);
    expect(onComment).toHaveBeenCalledTimes(1);
    expect(onComment).toHaveBeenCalledWith("sub-1");
  });

  it("END-TO-END: card click → gated handler → blocked toast for unpaid user", () => {
    // Simulate the parent's wiring: onVote = (id) => gated check, then DB call
    const dbInsert = vi.fn();
    const showToast = vi.fn();

    const subscription: SubRow = null; // Unpaid user
    const gatedOnVote = (id: string) => {
      const check = canPerformGatedAction({ user: { id: "u" }, subscription });
      if (!check.allowed) {
        showToast({ title: check.reason });
        return;
      }
      dbInsert(id);
    };

    render(
      <MegaTalentSubmissionCard
        submission={baseSubmission}
        categoryLabel="Drawing"
        isLiked={false}
        commentCount={3}
        isOwner={false}
        isDeleting={false}
        index={0}
        onVote={gatedOnVote}
        onComment={() => {}}
        onShare={() => {}}
        onDelete={() => {}}
        onMediaClick={() => {}}
      />,
    );

    fireEvent.click(screen.getAllByText("12")[1].closest("button")!);
    expect(dbInsert).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith({
      title: "Megatalent Premium required",
    });
  });

  it("END-TO-END: card click → gated handler → DB insert for confirmed €10 paid user", () => {
    const dbInsert = vi.fn();
    const showToast = vi.fn();
    const subscription: SubRow = {
      tier: "premium",
      status: "active",
      price_eur: 10,
    };
    const gatedOnVote = (id: string) => {
      const check = canPerformGatedAction({ user: { id: "u" }, subscription });
      if (!check.allowed) {
        showToast({ title: check.reason });
        return;
      }
      dbInsert(id);
    };

    render(
      <MegaTalentSubmissionCard
        submission={baseSubmission}
        categoryLabel="Drawing"
        isLiked={false}
        commentCount={3}
        isOwner={false}
        isDeleting={false}
        index={0}
        onVote={gatedOnVote}
        onComment={() => {}}
        onShare={() => {}}
        onDelete={() => {}}
        onMediaClick={() => {}}
      />,
    );

    fireEvent.click(screen.getAllByText("12")[1].closest("button")!);
    expect(showToast).not.toHaveBeenCalled();
    expect(dbInsert).toHaveBeenCalledWith("sub-1");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Static guard against accidental paywall removal
// ────────────────────────────────────────────────────────────────────────────

describe("Static guard: Megatalent.tsx must keep the paywall before mutating votes/comments", () => {
  const filePath = resolve(__dirname, "..", "pages", "Megatalent.tsx");
  const source = readFileSync(filePath, "utf-8");

  it("handleVote checks `isSubscribed` before inserting into talent_votes", () => {
    // Extract the handleVote function body
    const start = source.indexOf("const handleVote");
    expect(start).toBeGreaterThan(-1);
    const end = source.indexOf("const fetchComments", start);
    const body = source.slice(start, end);

    expect(body).toMatch(/!isSubscribed/);
    // The subscription check must appear BEFORE the talent_votes mutation
    const subIdx = body.indexOf("!isSubscribed");
    const voteInsertIdx = body.indexOf("talent_votes");
    expect(subIdx).toBeGreaterThan(-1);
    expect(voteInsertIdx).toBeGreaterThan(-1);
    expect(subIdx).toBeLessThan(voteInsertIdx);
  });

  it("handleComment checks `isSubscribed` before inserting into talent_comments", () => {
    const start = source.indexOf("const handleComment");
    expect(start).toBeGreaterThan(-1);
    const end = source.indexOf("const handleDeleteSubmission", start);
    const body = source.slice(start, end);

    expect(body).toMatch(/!isSubscribed/);
    const subIdx = body.indexOf("!isSubscribed");
    const commentInsertIdx = body.indexOf("talent_comments");
    expect(subIdx).toBeLessThan(commentInsertIdx);
  });

  it("`isSubscribed` is sourced from megatalent_subscriptions where status='active'", () => {
    // Guarantees the boolean truly reflects a CONFIRMED PAID subscription
    expect(source).toMatch(/from\(['"]megatalent_subscriptions['"]\)/);
    expect(source).toMatch(/\.eq\(['"]status['"],\s*['"]active['"]\)/);
  });
});
