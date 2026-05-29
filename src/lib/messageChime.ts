// Unique message notification chime, generated via Web Audio API.
// A short crystalline two-note "ping-pong" with a soft shimmer tail
// — distinctive enough to not be confused with native OS sounds.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lastPlay = 0;
let unlockBound = false;


function bindUnlock() {
  if (unlockBound || typeof window === "undefined") return;
  unlockBound = true;
  const unlock = () => {
    const ac = getCtx();
    if (ac && ac.state === "suspended") ac.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock, { once: false, passive: true });
  window.addEventListener("keydown", unlock, { once: false });
  window.addEventListener("touchstart", unlock, { once: false, passive: true });
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AC) return null;
      ctx = new AC();
    }
    if (!masterGain && ctx) {
      masterGain = ctx.createGain();
      masterGain.gain.value = 2.8; // global boost so chime is audible on mobile
      masterGain.connect(ctx.destination);
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
  // tiny pitch drop for "pluck" feel
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.92, 60), start + dur);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(gain).connect(masterGain ?? ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playMessageChime() {
  // throttle so a burst of messages doesn't machine-gun the speaker
  const now = Date.now();
  if (now - lastPlay < 250) return;
  lastPlay = now;

  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + 0.005;

  // signature: bright bell + airy harmonic, two-note rising 5th
  // note 1 — C6 (1046.5)
  tone(ac, 1046.5, t0, 0.18, "triangle", 0.18);
  tone(ac, 2093.0, t0, 0.14, "sine", 0.06); // shimmer harmonic
  // note 2 — G6 (1568) slight delay
  tone(ac, 1567.98, t0 + 0.09, 0.22, "triangle", 0.16);
  tone(ac, 3135.96, t0 + 0.09, 0.16, "sine", 0.05);
  // soft sub click for "tap" front-edge
  tone(ac, 220, t0, 0.05, "sine", 0.08);
}
