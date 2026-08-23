import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPendingMegatalentSubmission,
  readPendingMegatalentSubmission,
  savePendingMegatalentSubmission,
} from "./megatalentPendingSubmission";

const draft = {
  userId: "user-1",
  title: "My performance",
  description: "A contest entry",
  category: "singing",
  mediaUrl: "https://example.com/performance.mp4",
  mediaType: "video" as const,
  createdAt: "2026-08-23T21:00:00.000Z",
};

describe("MegaTalent pending submission", () => {
  beforeEach(() => window.localStorage.clear());

  it("restores only the signed-in user's draft", () => {
    savePendingMegatalentSubmission(draft);
    expect(readPendingMegatalentSubmission("user-1")).toEqual(draft);
    expect(readPendingMegatalentSubmission("user-2")).toBeNull();
  });

  it("clears the draft after publishing", () => {
    savePendingMegatalentSubmission(draft);
    clearPendingMegatalentSubmission();
    expect(readPendingMegatalentSubmission("user-1")).toBeNull();
  });
});