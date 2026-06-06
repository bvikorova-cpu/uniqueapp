// Deno tests for anonymous dating shared helpers (Zod schemas + PII sanitizer).
// Run: bunx supabase functions test (or supabase--test_edge_functions tool).
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  aiRequestSchema,
  findMatchSchema,
  sanitizePayloadForLog,
  errorResponse,
} from "./anonymous-dating.ts";

Deno.test("aiRequestSchema accepts minimal valid payload", () => {
  const r = aiRequestSchema.safeParse({ feature: "icebreaker" });
  assert(r.success);
});

Deno.test("aiRequestSchema rejects oversized message (>4000 chars)", () => {
  const big = "x".repeat(4001);
  const r = aiRequestSchema.safeParse({
    feature: "chat",
    payload: { message: big },
  });
  assert(!r.success);
});

Deno.test("aiRequestSchema caps chat_history at 50 messages", () => {
  const msgs = Array.from({ length: 51 }, () => ({ role: "user", content: "hi" }));
  const r = aiRequestSchema.safeParse({
    feature: "chat",
    payload: { chat_history: msgs },
  });
  assert(!r.success);
});

Deno.test("findMatchSchema defaults mode to 'match' and filters to {}", () => {
  const r = findMatchSchema.parse({});
  assertEquals(r.mode, "match");
  assertEquals(r.filters, {});
});

Deno.test("findMatchSchema rejects invalid targetUserId", () => {
  const r = findMatchSchema.safeParse({ targetUserId: "not-a-uuid" });
  assert(!r.success);
});

Deno.test("sanitizePayloadForLog strips raw strings, keeps shape", () => {
  const out = sanitizePayloadForLog({
    message: "secret love letter",
    chat_history: [{ role: "user", content: "hi" }],
    user_profile: { name: "Alice", age: 30 },
    matchId: "uuid-here",
  });
  assertEquals((out.message as { length: number }).length, "secret love letter".length);
  assertEquals((out.chat_history as { count: number }).count, 1);
  assertEquals((out.user_profile as { keys: number }).keys, 2);
  // primitives pass through
  assert(typeof out.matchId === "object");
});

Deno.test("errorResponse returns JSON with code/message/status", async () => {
  const res = errorResponse("RATE_LIMITED", "Slow down", 429);
  assertEquals(res.status, 429);
  const body = await res.json();
  assertEquals(body.error, "RATE_LIMITED");
  assertEquals(body.message, "Slow down");
});
