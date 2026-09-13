/**
 * Renders extracted frames in reverse order into a WebM file using
 * MediaRecorder on an offscreen canvas. Optionally burns in the
 * "Created with Unique" watermark in the bottom-right corner.
 */

export const WATERMARK_TEXT = "Created with Unique";

export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const unit = Math.min(width, height);
  const fontSize = Math.max(12, Math.round(unit * 0.045));
  const pad = Math.round(unit * 0.04);
  ctx.save();
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = Math.max(3, Math.round(unit * 0.01));
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.fillText(WATERMARK_TEXT, width - pad, height - pad);
  ctx.restore();
}

function pickMimeType(): string | undefined {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return undefined;
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export interface ExportOptions {
  frames: ImageBitmap[];
  width: number;
  height: number;
  fps: number;
  watermark: boolean;
  onProgress?: (ratio: number) => void;
}

function waitUntil(deadline: number): Promise<void> {
  return new Promise((resolve) => {
    const check = (now: number) => {
      if (now >= deadline) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

export async function exportReversedVideo({
  frames,
  width,
  height,
  fps,
  watermark,
  onProgress,
}: ExportOptions): Promise<Blob> {
  const mimeType = pickMimeType();
  if (!mimeType) throw new Error("Your browser cannot export video recordings.");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not prepare the export canvas.");

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = () => reject(new Error("Recording failed. Please try a shorter clip."));
  });

  recorder.start();

  const total = frames.length;
  const frameDuration = 1000 / fps;
  const startedAt = performance.now();
  for (let i = 0; i < total; i++) {
    if (i > 0) await waitUntil(startedAt + i * frameDuration);
    const bitmap = frames[total - 1 - i];
    if (bitmap) ctx.drawImage(bitmap, 0, 0, width, height);
    if (watermark) drawWatermark(ctx, width, height);
    onProgress?.((i + 1) / total);
  }

  // Hold the last frame for exactly one frame interval so it is recorded.
  await waitUntil(startedAt + total * frameDuration);
  recorder.stop();
  stream.getTracks().forEach((t) => t.stop());
  return finished;
}
