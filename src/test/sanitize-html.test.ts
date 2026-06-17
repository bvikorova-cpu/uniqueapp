import { describe, it, expect } from "vitest";
import { sanitizeHtml, escapeWithLineBreaks } from "@/lib/sanitizeHtml";

describe("sanitizeHtml — XSS prevention", () => {
  it("strips <script>", () => {
    const out = sanitizeHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert");
    expect(out).toContain("<p>hi</p>");
  });

  it("strips on* event handlers", () => {
    const out = sanitizeHtml('<a href="x" onclick="alert(1)">x</a>');
    expect(out).not.toContain("onclick");
    expect(out).toContain("<a");
  });

  it("strips javascript: URLs", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });

  it("strips <iframe>, <object>, <embed>, <form>, <input>, <style>", () => {
    for (const tag of ["iframe", "object", "embed", "form", "input", "style"]) {
      const out = sanitizeHtml(`<${tag}>x</${tag}>`);
      expect(out).not.toContain(`<${tag}`);
    }
  });

  it("strips <img onerror>", () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">');
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("alert");
  });

  it("keeps allowed formatting", () => {
    const out = sanitizeHtml("<b>bold</b> <em>em</em> <a href=\"https://x.com\">link</a>");
    expect(out).toContain("<b>bold</b>");
    expect(out).toContain("<em>em</em>");
    expect(out).toContain("href=\"https://x.com\"");
  });

  it("strips data-* attributes", () => {
    const out = sanitizeHtml('<div data-evil="x">hi</div>');
    expect(out).not.toContain("data-evil");
  });
});

describe("escapeWithLineBreaks", () => {
  it("escapes HTML entities", () => {
    expect(escapeWithLineBreaks("<script>")).toBe("&lt;script&gt;");
  });
  it("converts \\n to <br/> after escaping", () => {
    expect(escapeWithLineBreaks("a\nb")).toBe("a<br/>b");
  });
  it("escapes quotes", () => {
    const out = escapeWithLineBreaks(`he said "hi" & 'bye'`);
    expect(out).toContain("&quot;");
    expect(out).toContain("&#39;");
    expect(out).toContain("&amp;");
  });
});
