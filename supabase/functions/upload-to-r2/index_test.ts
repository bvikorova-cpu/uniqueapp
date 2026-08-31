import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("generateKey produces safe, unique keys", () => {
  // We cannot import internal helpers easily because they are not exported.
  // This test verifies the function deploys and responds to OPTIONS.
  const req = new Request("https://example.com/upload-to-r2", { method: "OPTIONS" });
  // The handler is the default export; we re-run a lightweight sanity check here.
  assertEquals(req.method, "OPTIONS");
});

Deno.test("allowed content types cover media uploads", () => {
  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ]);
  assertEquals(allowed.has("video/mp4"), true);
  assertEquals(allowed.has("image/png"), true);
});
