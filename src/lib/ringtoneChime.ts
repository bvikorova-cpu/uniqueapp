// Unique looping ringtone for incoming video calls.
// A two-chord "trill" that repeats every ~1.6s until stopped.
// Distinct from messageChime (bell) and notificationChime (descending triad).

let ctx: AudioContext | null = null;
let loopTimer: number | null = null;
let masterGain: GainNode | null = null;
let unlockBound = false;

function bindUnlock() {
  if (unlockBound || typeof window === "undefined") return;
  unlockBound = true;
  const unlock = () => {
    const ac = getCtx();
    if (ac && ac.state === "suspended") ac.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

if (typeof window !== "undefined") bindUnlock();

function tone(
  ac: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function playOneRing(ac: AudioContext, dest: AudioNode, t0: number) {
  // Signature: alternating A5–E6 trill twice, then a soft warm pad
  const a5 = 880.0;
  const e6 = 1318.5;
  // First trill pair
  tone(ac, dest, a5, t0, 0.18, "triangle", 0.22);
  tone(ac, dest, e6, t0 + 0.18, 0.18, "triangle", 0.22);
  // Second trill pair
  tone(ac, dest, a5, t0 + 0.42, 0.18, "triangle", 0.22);
  tone(ac, dest, e6, t0 + 0.60, 0.22, "triangle", 0.24);
  // Warm low pad underneath
  tone(ac, dest, 220, t0, 0.85, "sine", 0.08);
  // Sparkle harmonic at the top
  tone(ac, dest, 2637.0, t0 + 0.18, 0.12, "sine", 0.05);
}

export function startRingtone() {
  stopRingtone();
  const ac = getCtx();
  if (!ac) return;

  masterGain = ac.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(ac.destination);

  const RING_PERIOD_MS = 1600;
  const fire = () => {
    if (!ac || !masterGain) return;
    playOneRing(ac, masterGain, ac.currentTime + 0.01);
  };
  fire();
  loopTimer = window.setInterval(fire, RING_PERIOD_MS);
}

export function stopRingtone() {
  if (loopTimer !== null) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  if (masterGain) {
    try {
      const ac = getCtx();
      if (ac) {
        masterGain.gain.cancelScheduledValues(ac.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.15);
      }
      setTimeout(() => {
        try { masterGain?.disconnect(); } catch {}
        masterGain = null;
      }, 200);
    } catch {
      masterGain = null;
    }
  }
}
