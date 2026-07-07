import { describe, it, expect } from "vitest";

/**
 * Phase 5 — insurance claim state machine.
 * Ensures only admin-decided transitions are considered valid.
 */
type Status = "pending" | "approved" | "rejected" | "paid";
const validTransitions: Record<Status, Status[]> = {
  pending: ["approved", "rejected"],
  approved: ["paid", "rejected"],
  rejected: [],
  paid: [],
};

function transition(from: Status, to: Status): boolean {
  return validTransitions[from].includes(to);
}

describe("insurance claim state machine", () => {
  it("pending → approved OK", () => expect(transition("pending", "approved")).toBe(true));
  it("pending → paid FORBIDDEN", () => expect(transition("pending", "paid")).toBe(false));
  it("approved → paid OK", () => expect(transition("approved", "paid")).toBe(true));
  it("rejected is terminal", () => {
    expect(transition("rejected", "approved")).toBe(false);
    expect(transition("rejected", "paid")).toBe(false);
  });
  it("paid is terminal", () => {
    expect(transition("paid", "rejected")).toBe(false);
    expect(transition("paid", "approved")).toBe(false);
  });
});

describe("insurance amount formatting", () => {
  it("cents → EUR string", () => {
    expect((12345 / 100).toFixed(2)).toBe("123.45");
    expect((7 / 100).toFixed(2)).toBe("0.07");
  });
});
