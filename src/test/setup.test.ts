import { describe, it, expect } from "vitest";

describe("environment", () => {
  it("has jsdom DOM available", () => {
    const el = document.createElement("div");
    el.textContent = "ok";
    expect(el.textContent).toBe("ok");
  });

  it("has matchMedia polyfill", () => {
    expect(typeof window.matchMedia).toBe("function");
    expect(window.matchMedia("(min-width: 0px)").matches).toBe(false);
  });

  it("has IntersectionObserver polyfill", () => {
    expect(typeof (globalThis as any).IntersectionObserver).toBe("function");
  });
});
