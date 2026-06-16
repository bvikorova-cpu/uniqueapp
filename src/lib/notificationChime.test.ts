import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock AudioContext pre jsdom
class FakeOscillator {
  type = "sine";
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn(() => ({ connect: vi.fn() }));
  start = vi.fn();
  stop = vi.fn();
}
class FakeGain {
  gain = {
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn(() => ({ connect: vi.fn() }));
}
class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createOscillator = vi.fn(() => new FakeOscillator());
  createGain = vi.fn(() => new FakeGain());
  resume = vi.fn(() => Promise.resolve());
}

describe("notificationChime", () => {
  let createOscSpy: any;

  beforeEach(() => {
    vi.resetModules();
    (window as any).AudioContext = FakeAudioContext;
  });

  afterEach(() => {
    delete (window as any).AudioContext;
  });

  it("plays a descending triad (5 tones) on first call", async () => {
    const mod = await import("./notificationChime");
    const acInstances: FakeAudioContext[] = [];
    (window as any).AudioContext = class extends FakeAudioContext {
      constructor() {
        super();
        acInstances.push(this);
      }
    };
    mod.playNotificationChime();
    expect(acInstances.length).toBe(1);
    // E5, C5, G4, G3 pad, sparkle = 5 oscillators
    expect(acInstances[0].createOscillator).toHaveBeenCalledTimes(5);
  });

  it("debounce: second call within 400 ms is skipped", async () => {
    const mod = await import("./notificationChime");
    const acInstances: FakeAudioContext[] = [];
    (window as any).AudioContext = class extends FakeAudioContext {
      constructor() {
        super();
        acInstances.push(this);
      }
    };
    mod.playNotificationChime();
    const callsAfterFirst = acInstances[0].createOscillator.mock.calls.length;
    mod.playNotificationChime();
    expect(acInstances[0].createOscillator.mock.calls.length).toBe(callsAfterFirst);
  });

  it("silent fallback without AudioContext API (no throw)", async () => {

    delete (window as any).AudioContext;
    delete (window as any).webkitAudioContext;
    const mod = await import("./notificationChime");
    expect(() => mod.playNotificationChime()).not.toThrow();
  });
});
