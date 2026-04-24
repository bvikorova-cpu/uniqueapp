import { describe, it, expect, vi, beforeEach } from "vitest";

// We mock supabase BEFORE importing logger so persistLog uses the mock.
const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn(() => ({ insert: insertMock }));
const getSessionMock = vi.fn().mockResolvedValue({
  data: { session: { user: { id: "user-1" } } },
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: ((table: string) => fromMock(table)) as any,
    auth: { getSession: () => getSessionMock() },
  },
}));

import { logger } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
  });

  it("persists info logs", async () => {
    logger.info("info-msg-" + Math.random());
    await new Promise((r) => setTimeout(r, 10));
    expect(fromMock).toHaveBeenCalledWith("app_error_logs");
    expect(insertMock).toHaveBeenCalled();
    const payload = insertMock.mock.calls[0][0];
    expect(payload.severity).toBe("info");
  });

  it("persists error with stack", async () => {
    const err = new Error("boom-" + Math.random());
    logger.error(err);
    await new Promise((r) => setTimeout(r, 10));
    const payload = insertMock.mock.calls.at(-1)![0];
    expect(payload.severity).toBe("error");
    expect(payload.error_message).toContain("boom-");
    expect(payload.error_stack).toBeTruthy();
  });

  it("throttles duplicate messages within window", async () => {
    const msg = "dup-" + Math.random();
    logger.warn(msg);
    logger.warn(msg);
    logger.warn(msg);
    await new Promise((r) => setTimeout(r, 10));
    // First call inserts, subsequent dedup'd
    const matching = insertMock.mock.calls.filter(
      (c) => c[0].error_message === msg
    );
    expect(matching.length).toBe(1);
  });

  it("never throws even if DB insert fails", async () => {
    insertMock.mockRejectedValueOnce(new Error("db down"));
    expect(() => logger.error(new Error("x-" + Math.random()))).not.toThrow();
    await new Promise((r) => setTimeout(r, 10));
  });
});
