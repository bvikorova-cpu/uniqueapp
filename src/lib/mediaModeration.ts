// Platform rule: erotic, nude and sexual content is not allowed.
// This guard screens media BEFORE it is uploaded/published.
// - images: one frame
// - videos: several sampled frames (start / middle / end)
import { supabase } from "@/integrations/supabase/client";

export interface MediaModVerdict {
  allowed: boolean;
  reason?: string;
  categories?: string[];
}

const FRAME_MAX = 640;

function frameToDataUrl(video: HTMLVideoElement): string | null {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, FRAME_MAX / Math.max(video.videoWidth || 1, video.videoHeight || 1));
  canvas.width = Math.max(1, Math.round((video.videoWidth || FRAME_MAX) * scale));
  canvas.height = Math.max(1, Math.round((video.videoHeight || FRAME_MAX) * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  try {
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

/** Extract up to `count` JPEG data URLs spread across the video timeline. */
export async function extractVideoFrames(file: File, count = 3): Promise<string[]> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    const frames: string[] = [];
    let targets: number[] = [];
    let idx = 0;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      resolve(frames);
    };

    const timeout = window.setTimeout(finish, 15000);

    const seekNext = () => {
      if (idx >= targets.length) {
        window.clearTimeout(timeout);
        finish();
        return;
      }
      video.currentTime = targets[idx++];
    };

    video.onloadedmetadata = () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      const n = Math.max(1, count);
      targets = Array.from({ length: n }, (_, i) => Math.min(dur - 0.05, (dur * (i + 0.5)) / n));
      seekNext();
    };
    video.onseeked = () => {
      const f = frameToDataUrl(video);
      if (f) frames.push(f);
      seekNext();
    };
    video.onerror = () => {
      window.clearTimeout(timeout);
      finish();
    };
    video.src = url;
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

async function callModeration(imageUrls: string[]): Promise<MediaModVerdict> {
  if (imageUrls.length === 0) return { allowed: true, reason: "no_frames" };
  const { data, error } = await supabase.functions.invoke("moderate-image", {
    body: { image_urls: imageUrls },
  });
  if (error || !data) return { allowed: true, reason: "invoke_failed" };
  const res = data as { allowed?: boolean; categories?: string[]; reason?: string };
  return {
    allowed: res.allowed !== false,
    categories: res.categories,
    reason: res.reason,
  };
}

/** Screen a local image or video file for nudity / sexual content. */
export async function screenMediaFile(file: File): Promise<MediaModVerdict> {
  try {
    if (file.type.startsWith("video/")) {
      const frames = await extractVideoFrames(file, 3);
      return await callModeration(frames);
    }
    if (file.type.startsWith("image/")) {
      const dataUrl = await fileToDataUrl(file);
      return await callModeration([dataUrl]);
    }
    return { allowed: true, reason: "unsupported_type" };
  } catch {
    return { allowed: true, reason: "screen_failed" };
  }
}

/** Screen an already-uploaded media URL (image only). */
export async function screenMediaUrl(url: string): Promise<MediaModVerdict> {
  return await callModeration([url]);
}

export const NSFW_BLOCK_MESSAGE =
  "Erotic, nude or sexual content is not allowed on this platform. Please choose different media.";
