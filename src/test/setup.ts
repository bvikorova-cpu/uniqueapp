import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom matchMedia polyfill
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// IntersectionObserver polyfill
class IO {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}
(globalThis as any).IntersectionObserver = IO;

// ResizeObserver polyfill
class RO {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as any).ResizeObserver = RO;

// Scroll polyfill
window.scrollTo = vi.fn() as any;
