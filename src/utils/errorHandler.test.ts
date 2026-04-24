import { describe, it, expect } from "vitest";
import {
  getUserFriendlyErrorMessage,
  handleSupabaseFunctionError,
} from "./errorHandler";

describe("getUserFriendlyErrorMessage", () => {
  it("returns fallback for unknown values", () => {
    expect(getUserFriendlyErrorMessage(null)).toMatch(/something went wrong/i);
  });

  it("translates non-2xx edge function errors", () => {
    const msg = getUserFriendlyErrorMessage(
      new Error("Edge Function returned a non-2xx status code")
    );
    expect(msg).toMatch(/temporarily unavailable/i);
  });

  it("translates network errors", () => {
    expect(
      getUserFriendlyErrorMessage(new Error("Failed to fetch"))
    ).toMatch(/network error/i);
  });

  it("translates rate limits", () => {
    expect(
      getUserFriendlyErrorMessage(new Error("rate limit exceeded"))
    ).toMatch(/too many requests/i);
  });

  it("translates insufficient credits", () => {
    expect(
      getUserFriendlyErrorMessage(new Error("Insufficient credits balance"))
    ).toMatch(/insufficient credits/i);
  });

  it("passes through clean human messages", () => {
    expect(getUserFriendlyErrorMessage("All good but failed")).toBe(
      "All good but failed"
    );
  });

  it("falls back when message is overly technical", () => {
    expect(
      getUserFriendlyErrorMessage(new Error("TypeError: cannot read x"))
    ).toMatch(/something went wrong/i);
  });
});

describe("handleSupabaseFunctionError", () => {
  it("includes action in fallback when error is technical", () => {
    const msg = handleSupabaseFunctionError(
      new Error("TypeError: weird internal failure"),
      "save profile"
    );
    expect(msg.toLowerCase()).toContain("save profile");
  });

  it("still translates known patterns over the action fallback", () => {
    const msg = handleSupabaseFunctionError(
      new Error("Failed to fetch"),
      "save profile"
    );
    expect(msg.toLowerCase()).toMatch(/network error/);
  });
});
