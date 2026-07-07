/**
 * Semantic unit tests for doctor availability slot generation.
 * Mirrors the slot-building logic in supabase/functions/doctor-availability-slots
 * so we catch regressions where booked appointments or blocks fail to
 * exclude conflicting slots.
 */
import { describe, it, expect } from "vitest";

type Interval = { start: number; end: number };

function generateSlots(
  dayStart: number,
  dayEnd: number,
  slotMin: number,
  blocks: Interval[],
  booked: Interval[],
): string[] {
  const slots: string[] = [];
  const slotMs = slotMin * 60000;
  for (let t = dayStart; t + slotMs <= dayEnd; t += slotMs) {
    const slotEnd = t + slotMs;
    const conflict =
      blocks.some((b) => t < b.end && slotEnd > b.start) ||
      booked.some((b) => t < b.end && slotEnd > b.start);
    if (!conflict) slots.push(new Date(t).toISOString());
  }
  return slots;
}

const DAY = new Date("2026-07-10T00:00:00Z").getTime();
const nineAM = DAY + 9 * 3600 * 1000;
const fivePM = DAY + 17 * 3600 * 1000;

describe("doctor availability — slot generation", () => {
  it("generates 30-minute slots across an 8h window", () => {
    const slots = generateSlots(nineAM, fivePM, 30, [], []);
    expect(slots.length).toBe(16);
  });

  it("generates 60-minute slots across an 8h window", () => {
    const slots = generateSlots(nineAM, fivePM, 60, [], []);
    expect(slots.length).toBe(8);
  });

  it("excludes slots that overlap a block (e.g. lunch break)", () => {
    const lunchStart = DAY + 12 * 3600 * 1000;
    const lunchEnd = DAY + 13 * 3600 * 1000;
    const slots = generateSlots(nineAM, fivePM, 30, [{ start: lunchStart, end: lunchEnd }], []);
    // 16 base slots - 2 overlapping lunch = 14
    expect(slots.length).toBe(14);
    // No slot starts at 12:00 or 12:30
    expect(slots).not.toContain(new Date(lunchStart).toISOString());
    expect(slots).not.toContain(new Date(lunchStart + 30 * 60000).toISOString());
  });

  it("excludes slots that overlap an existing booking", () => {
    const booking = { start: nineAM, end: nineAM + 30 * 60000 };
    const slots = generateSlots(nineAM, fivePM, 30, [], [booking]);
    expect(slots.length).toBe(15);
    expect(slots[0]).toBe(new Date(nineAM + 30 * 60000).toISOString());
  });

  it("does not exclude adjacent (touching but non-overlapping) intervals", () => {
    // block ends exactly when a slot starts → the following slot is still available
    const block = { start: nineAM, end: nineAM + 30 * 60000 };
    const slots = generateSlots(nineAM, fivePM, 30, [block], []);
    expect(slots[0]).toBe(new Date(nineAM + 30 * 60000).toISOString());
  });

  it("returns 0 slots when the entire day is blocked", () => {
    const slots = generateSlots(nineAM, fivePM, 30, [{ start: nineAM, end: fivePM }], []);
    expect(slots.length).toBe(0);
  });

  it("returns 0 slots when window is smaller than one slot", () => {
    const slots = generateSlots(nineAM, nineAM + 20 * 60000, 30, [], []);
    expect(slots.length).toBe(0);
  });

  it("handles overlapping blocks + bookings without double-counting", () => {
    const block = { start: nineAM + 3600 * 1000, end: nineAM + 2 * 3600 * 1000 }; // 10-11
    const booking = { start: nineAM + 1.5 * 3600 * 1000, end: nineAM + 2.5 * 3600 * 1000 }; // 10:30-11:30
    const slots = generateSlots(nineAM, fivePM, 30, [block], [booking]);
    // Removes slots at 10:00, 10:30, 11:00 = 13 remaining
    expect(slots.length).toBe(13);
  });
});
