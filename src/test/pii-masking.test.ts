import { describe, it, expect } from "vitest";
import { maskEmail, maskPhone, maskIP, maskName, maskUUID } from "@/lib/maskPII";

describe("maskPII — security invariants", () => {
  describe("maskEmail", () => {
    it("masks long local part keeping 2 chars + domain", () => {
      expect(maskEmail("johndoe@example.com")).toBe("jo***@example.com");
    });
    it("masks short local part (<=2)", () => {
      expect(maskEmail("ab@x.com")).toBe("a***@x.com");
      expect(maskEmail("a@x.com")).toBe("a***@x.com");
    });
    it("handles empty/null", () => {
      expect(maskEmail(null)).toBe("");
      expect(maskEmail(undefined)).toBe("");
      expect(maskEmail("")).toBe("");
    });
    it("never leaks the full local part", () => {
      const e = "supersecretuser@yandex.com";
      const masked = maskEmail(e);
      expect(masked).not.toContain("supersecretuser");
      expect(masked).toContain("@yandex.com");
    });
    it("malformed (no @) returns ***", () => {
      expect(maskEmail("not-an-email")).toBe("***");
    });
  });

  describe("maskPhone", () => {
    it("keeps last 3 digits", () => {
      const m = maskPhone("+421901234567");
      expect(m).toMatch(/567$/);
      expect(m).not.toContain("234");
    });
    it("returns *** for <4 digits", () => {
      expect(maskPhone("12")).toBe("***");
    });
    it("handles empty", () => {
      expect(maskPhone(null)).toBe("");
    });
  });

  describe("maskIP", () => {
    it("IPv4 keeps first 2 octets", () => {
      expect(maskIP("192.168.1.100")).toBe("192.168.*.*");
    });
    it("IPv6 keeps first 2 segments", () => {
      expect(maskIP("2001:db8:85a3::8a2e:370:7334")).toMatch(/^2001:db8:\*+/);
    });
    it("malformed returns ***", () => {
      expect(maskIP("not-an-ip")).toBe("***");
    });
  });

  describe("maskName / maskUUID", () => {
    it("name keeps first char only", () => {
      expect(maskName("Beata")).toBe("B****");
      expect(maskName("X")).toBe("*");
    });
    it("uuid keeps prefix only", () => {
      const id = "abcdef12-3456-7890-abcd-ef1234567890";
      expect(maskUUID(id)).toBe("abcdef12…");
      expect(maskUUID(id)).not.toContain("567890");
    });
  });
});
