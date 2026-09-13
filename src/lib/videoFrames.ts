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

function waitForDecodedFrame(video: HTMLVideoElement): Promise<number> {
  if (typeof video.requestVideoFrameCallback !== "function") {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(video.currentTime)));
    });
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (mediaTime: number) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallback);
      resolve(mediaTime);
    };
    const fallback = window.setTimeout(() => finish(video.currentTime), 250);
    video.requestVideoFrameCallback((_now, metadata) => finish(metadata.mediaTime));
  });
}

function waitForCurrentData(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The first video frame could not be decoded."));
    };
    const cleanup = () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

async function seekTo(video: HTMLVideoElement, time: number): Promise<number> {
  const target = Math.max(0, time);
  if (Math.abs(video.currentTime - target) < 0.0005) {
    await waitForCurrentData(video);
    return waitForDecodedFrame(video);
  }

  await new Promise<void>((resolve, reject) => {
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
      video.currentTime = target;
    } catch (e) {
      cleanup();
      reject(e instanceof Error ? e : new Error("Seeking failed."));
    }
  });

  // Some mobile browsers emit `seeked` before the decoded frame is ready for
  // canvas. Waiting for the presented frame prevents stale/duplicate captures.
  return waitForDecodedFrame(video);
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
  let lastMediaTime = -1;

  for (let i = 0; i < total; i++) {
    if (shouldAbort?.()) break;
    const mediaTime = await seekTo(video, Math.min(duration - 0.001, i * step));
    // A 24/25 fps source sampled at 30 fps otherwise contains repeated frames,
    // which looks like shaking when played backwards.
    if (lastMediaTime >= 0 && Math.abs(mediaTime - lastMediaTime) < 0.0005) {
      onProgress?.((i + 1) / total);
      continue;
    }
    ctx.drawImage(video, 0, 0, width, height);
    frames.push(await createImageBitmap(canvas));
    lastMediaTime = mediaTime;
    onProgress?.((i + 1) / total);
  }

  if (!frames.length) throw new Error("No frames could be extracted from this video.");
  const playbackFps = Math.max(1, frames.length / duration);
  return { frames, width, height, fps: playbackFps, duration };
}

export function disposeFrames(frames: ImageBitmap[]) {
  frames.forEach((f) => f.close?.());
}
