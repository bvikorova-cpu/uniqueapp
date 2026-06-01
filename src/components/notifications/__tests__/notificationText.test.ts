import { describe, it, expect } from "vitest";
import {
  displayNameOf,
  hasActor,
  getNotificationText,
  getAvatarFallbackChar,
  type NotificationLike,
} from "../notificationText";

const FORBIDDEN = ["Someone", "Unknown user", "Unknown User"];

const TYPES = [
  "like",
  "comment",
  "reaction",
  "repost",
  "follow",
  "friend_request",
  "job_application",
  "verification_request",
  "weekly_xp_winner",
  "weekly_xp_leaderboard",
  "masterchef_payout",
  "unknown_type",
];

describe("notificationText – missing actor", () => {
  it("displayNameOf returns empty string when actor missing", () => {
    expect(displayNameOf(undefined)).toBe("");
    expect(displayNameOf(null)).toBe("");
    expect(displayNameOf({ id: "x", full_name: null, username: null, avatar_url: null })).toBe("");
    expect(displayNameOf({ id: "x", full_name: "   ", username: "   ", avatar_url: null })).toBe("");
  });

  it("hasActor is false when no usable name", () => {
    expect(hasActor(undefined)).toBe(false);
    expect(hasActor(null)).toBe(false);
    expect(hasActor({ id: "x", full_name: null, username: null, avatar_url: null })).toBe(false);
  });

  it("getAvatarFallbackChar returns null without actor (so bell icon renders)", () => {
    expect(getAvatarFallbackChar(undefined)).toBeNull();
    expect(getAvatarFallbackChar(null)).toBeNull();
    expect(getAvatarFallbackChar({ id: "x", full_name: null, username: null, avatar_url: null })).toBeNull();
  });

  for (const type of TYPES) {
    it(`type=${type} never contains forbidden placeholders without actor`, () => {
      const n: NotificationLike = { type, actor: null };
      const text = getNotificationText(n);
      expect(text.length).toBeGreaterThan(0);
      for (const bad of FORBIDDEN) {
        expect(text).not.toContain(bad);
      }
    });
  }
});

describe("notificationText – with actor", () => {
  const actor = { id: "1", full_name: "Tomi", username: "tomi", avatar_url: null };

  it("uses full_name first", () => {
    expect(displayNameOf(actor)).toBe("Tomi");
    expect(hasActor(actor)).toBe(true);
    expect(getAvatarFallbackChar(actor)).toBe("T");
  });

  it("falls back to username", () => {
    const a = { id: "1", full_name: null, username: "tomi", avatar_url: null };
    expect(displayNameOf(a)).toBe("tomi");
    expect(getAvatarFallbackChar(a)).toBe("T");
  });

  it("renders name in standard event types", () => {
    expect(getNotificationText({ type: "like", actor })).toBe("Tomi liked your post");
    expect(getNotificationText({ type: "follow", actor })).toBe("Tomi started following you");
  });
});
