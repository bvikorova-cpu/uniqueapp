/** Client-side video frame extraction utilities (canvas based). */

export interface ExtractOptions {
  /** Target frames per second to sample. */
  fps?: number;
  /** Longest side of the extracted frames in px (keeps memory sane). */
  maxSize?: number;
  /** Called with 0..1 progress. */
  onProgress?: (ratio: number) => void;
  /** Abort signal-ish flag. */
  shouldAbort?: () => boolean;
}

export interface ExtractResult {
  frames: ImageBitmap[];
  width: number;
  height: number;
  fps: number;
  duration: number;
}

export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 10;

/** Load a video element and wait for its metadata. */
export function loadVideoElement(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    const onLoaded = () => {
      cleanup();
      resolve(video);
    };
    const onError = () => {
      cleanup();
      reject(new Error("This video could not be read by the browser."));
    };
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);
    video.load();
  });
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Seeking failed while extracting frames."));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    try {
      video.currentTime = Math.max(0, time);
    } catch (e) {
      cleanup();
      reject(e instanceof Error ? e : new Error("Seeking failed."));
    }
  });
}

/** Extract frames from a video by seeking at a fixed interval and drawing to a canvas. */
export async function extractFrames(
  video: HTMLVideoElement,
  { fps = 30, maxSize = 720, onProgress, shouldAbort }: ExtractOptions = {},
): Promise<ExtractResult> {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  if (!duration) throw new Error("The video length could not be determined.");

  let width = video.videoWidth || 720;
  let height = video.videoHeight || 1280;
  const longest = Math.max(width, height);
  if (longest > maxSize) {
    const ratio = maxSize / longest;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  const step = 1 / fps;
  const total = Math.max(1, Math.floor(duration / step));
  const frames: ImageBitmap[] = [];

  for (let i = 0; i < total; i++) {
    if (shouldAbort?.()) break;
    await seekTo(video, Math.min(duration - 0.001, i * step));
    ctx.drawImage(video, 0, 0, width, height);
    frames.push(await createImageBitmap(canvas));
    onProgress?.((i + 1) / total);
  }

  if (!frames.length) throw new Error("No frames could be extracted from this video.");
  return { frames, width, height, fps, duration };
}

export function disposeFrames(frames: ImageBitmap[]) {
  frames.forEach((f) => f.close?.());
}
