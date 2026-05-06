import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Megatalent upload storage RLS contract", () => {
  const source = readFileSync(resolve(__dirname, "..", "pages", "Megatalent.tsx"), "utf-8");
  const start = source.indexOf("const handleFileSelect");
  const end = source.indexOf("const handleSubmit", start);
  const body = source.slice(start, end);

  it("uploads into a user-owned first-level folder required by storage.foldername(name)[1]", () => {
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(body).toContain("${user.id}/${Date.now()}.${fileExt}");
    expect(body).not.toContain("${user.id}-${Date.now()}.${fileExt}");
  });

  it("keeps photo/video buckets and metadata aligned with the selected media type", () => {
    expect(body).toContain("const bucket = isImage ? 'media' : 'videos'");
    expect(body).toContain("contentType: file.type");
    expect(body).toContain("upsert: false");
  });

  it("keeps client-side MIME and size guards before the storage upload", () => {
    const validationIdx = body.indexOf("validMime");
    const sizeIdx = body.indexOf("maxBytes");
    const uploadIdx = body.indexOf(".upload(fileName, file");

    expect(validationIdx).toBeGreaterThan(-1);
    expect(sizeIdx).toBeGreaterThan(validationIdx);
    expect(uploadIdx).toBeGreaterThan(sizeIdx);
    expect(body).toContain("10 * 1024 * 1024");
    expect(body).toContain("200 * 1024 * 1024");
  });
});