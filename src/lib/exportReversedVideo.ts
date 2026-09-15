/**
 * Renders extracted frames in reverse order into a video file.
 *
 * Primary path uses WebCodecs through mediabunny: every frame gets an exact
 * timestamp, so the exported clip plays at the intended speed no matter how
 * fast the device can encode. MediaRecorder (the fallback) captures in real
 * time, which produced uneven, slow-motion output on phones.
 */

import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
  canEncodeVideo,
} from "mediabunny";

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

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  // Encoders need even dimensions.
  canvas.width = width % 2 === 0 ? width : width - 1;
  canvas.height = height % 2 === 0 ? height : height - 1;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not prepare the export canvas.");
  return { canvas, ctx };
}

/** Exact-timestamp encoding (no real-time capture) — smooth, correct speed. */
async function encodeWithWebCodecs({
  frames,
  width,
  height,
  fps,
  watermark,
  onProgress,
}: ExportOptions): Promise<Blob | null> {
  if (typeof VideoEncoder === "undefined") return null;

  const useMp4 = await canEncodeVideo("avc").catch(() => false);
  const codec = useMp4 ? ("avc" as const) : ("vp9" as const);
  if (!useMp4 && !(await canEncodeVideo("vp9").catch(() => false))) return null;

  const { canvas, ctx } = makeCanvas(width, height);
  const output = new Output({
    format: useMp4 ? new Mp4OutputFormat() : new WebMOutputFormat(),
    target: new BufferTarget(),
  });
  const source = new CanvasSource(canvas, { codec, bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: Math.round(fps) });
  await output.start();

  const total = frames.length;
  const frameDuration = 1 / fps;
  for (let i = 0; i < total; i++) {
    const bitmap = frames[total - 1 - i];
    if (bitmap) ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (watermark) drawWatermark(ctx, canvas.width, canvas.height);
    await source.add(i * frameDuration, frameDuration);
    onProgress?.((i + 1) / total);
  }

  source.close();
  await output.finalize();
  const buffer = output.target.buffer;
  if (!buffer) return null;
  return new Blob([buffer], { type: useMp4 ? "video/mp4" : "video/webm" });
}

/** Legacy real-time capture, used only when WebCodecs is unavailable. */
async function encodeWithMediaRecorder({
  frames,
  width,
  height,
  fps,
  watermark,
  onProgress,
}: ExportOptions): Promise<Blob> {
  const mimeType = pickMimeType();
  if (!mimeType) throw new Error("Your browser cannot export video recordings.");

  const { canvas, ctx } = makeCanvas(width, height);
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
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
    if (bitmap) ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (watermark) drawWatermark(ctx, canvas.width, canvas.height);
    track.requestFrame?.();
    onProgress?.((i + 1) / total);
  }

  await waitUntil(startedAt + total * frameDuration);
  recorder.stop();
  stream.getTracks().forEach((t) => t.stop());
  return finished;
}

export async function exportReversedVideo(options: ExportOptions): Promise<Blob> {
  try {
    const blob = await encodeWithWebCodecs(options);
    if (blob && blob.size > 0) return blob;
  } catch {
    // Fall through to the MediaRecorder path below.
  }
  return encodeWithMediaRecorder(options);
}
