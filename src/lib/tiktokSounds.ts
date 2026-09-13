/** Lightweight synthesized "sounds" for the reversed preview — no external audio files. */

export interface TikTokSound {
  id: string;
  label: string;
  bpm: number;
  /** Base note frequencies looped over the beat grid. */
  notes: number[];
  wave: OscillatorType;
}

export const TIKTOK_SOUNDS: TikTokSound[] = [
  { id: "none", label: "No sound", bpm: 0, notes: [], wave: "sine" },
  { id: "neon", label: "Neon Pulse", bpm: 124, notes: [220, 277, 330, 277], wave: "sawtooth" },
  { id: "dreamy", label: "Dreamy Loop", bpm: 96, notes: [261, 329, 392, 329], wave: "triangle" },
  { id: "glitch", label: "Glitch Beat", bpm: 140, notes: [110, 110, 165, 220], wave: "square" },
];

/** Plays a simple looping pattern until stopped. */
export class SoundLoop {
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private step = 0;

  start(sound: TikTokSound) {
    this.stop();
    if (!sound.notes.length || !sound.bpm) return;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    const interval = (60 / sound.bpm) * 1000;
    const tick = () => {
      const ctx = this.ctx;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = sound.wave;
      osc.frequency.value = sound.notes[this.step % sound.notes.length];
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      this.step += 1;
    };
    tick();
    this.timer = window.setInterval(tick, interval);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.step = 0;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
