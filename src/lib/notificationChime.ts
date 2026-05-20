// Unique notification chime — intentionally different from messageChime.
// Three-note descending arpeggio with a soft "whoosh" tail, sawtooth-based
// for a warmer, alert-style timbre (vs. the bright bell of messages).

let ctx: AudioContext | null = null;
let lastPlay = 0;

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
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playNotificationChime() {
  const now = Date.now();
  if (now - lastPlay < 400) return;
  lastPlay = now;

  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + 0.005;

  // Distinctive descending triad: E5 -> C5 -> G4 (a warm "ding-dong-dong")
  tone(ac, 659.25, t0, 0.16, "sine", 0.14);          // E5
  tone(ac, 523.25, t0 + 0.11, 0.18, "sine", 0.13);    // C5
  tone(ac, 392.0, t0 + 0.24, 0.30, "triangle", 0.12); // G4
  // soft low pad underneath for body
  tone(ac, 196.0, t0, 0.45, "sine", 0.05);            // G3 pad
  // subtle high sparkle
  tone(ac, 1318.5, t0 + 0.02, 0.10, "sine", 0.03);
}
