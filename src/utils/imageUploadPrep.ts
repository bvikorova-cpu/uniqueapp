// Universal image normalizer: converts ANY browser-readable image (incl. HEIC where
// the browser supports it via <img>) to a standard JPEG via canvas. This avoids
// "Database invalid or incompatible" style errors caused by exotic codecs or
// missing/odd MIME types from iOS/Android cameras.
//
// Falls back to the original file if anything fails (e.g. truly unreadable HEIC).

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.9;

export async function normalizeImageForUpload(file: File): Promise<File> {
  if (!file || !file.type?.startsWith("image/")) return file;

  // Already a sane JPEG/PNG/WebP under 5MB? Skip work.
  const isPlain = /image\/(jpeg|jpg|png|webp)/i.test(file.type);
  if (isPlain && file.size < 5 * 1024 * 1024) return file;

  try {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error || new Error("read failed"));
      reader.readAsDataURL(file);
    });

    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = dataUrl;
    });

    let { width, height } = img;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) return file;

    const base = (file.name || "image").replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch (err) {
    console.warn("[normalizeImageForUpload] falling back to original file", err);
    return file;
  }
}
