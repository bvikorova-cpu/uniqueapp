import { useEffect, useRef } from "react";
import previewFace from "@/assets/ar/preview-face.jpg";
import type { ArFilter } from "@/data/arFilters";

/** Anchor points of the neutral preview face, as fractions of the image size. */
const FACE = {
  eyeY: 0.39,
  eyeLeftX: 0.4,
  eyeRightX: 0.6,
  noseY: 0.5,
  mouthY: 0.575,
  neckY: 0.72,
  foreheadY: 0.3,
  centerX: 0.5,
};

const SIZE = 160;
const imageCache = new Map<string, HTMLImageElement>();

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const cached = imageCache.get(src);
    if (cached?.complete && cached.naturalWidth) return resolve(cached);
    const img = cached ?? new Image();
    imageCache.set(src, img);
    if (!img.src) img.src = src;
    if (img.complete && img.naturalWidth) return resolve(img);
    img.addEventListener("load", () => resolve(img), { once: true });
    img.addEventListener("error", reject, { once: true });
  });

/** Still preview of an AR filter, rendered on a neutral illustrated face. */
export const ArFilterPreview = ({ filter, className }: { filter: ArFilter; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const face = await loadImage(previewFace).catch(() => null);
      if (cancelled || !face) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(face, 0, 0, SIZE, SIZE);

      const eyeDistance = (FACE.eyeRightX - FACE.eyeLeftX) * SIZE;
      for (const overlay of filter.overlays) {
        const img = await loadImage(overlay.src).catch(() => null);
        if (cancelled || !img) continue;
        const width = eyeDistance * overlay.widthFactor;
        const height = (img.naturalHeight / img.naturalWidth) * width;
        const cx = FACE.centerX * SIZE;
        const baseY =
          overlay.anchor === "eyes"
            ? FACE.eyeY
            : overlay.anchor === "nose"
              ? FACE.noseY
              : overlay.anchor === "mouth"
                ? FACE.mouthY
                : overlay.anchor === "neck"
                  ? FACE.neckY
                : FACE.foreheadY;
        let cy = baseY * SIZE + eyeDistance * overlay.offsetY;
        if (overlay.anchor === "above-head") cy -= height / 2;
        ctx.drawImage(img, cx - width / 2, cy - height / 2, width, height);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      aria-label={`${filter.label} preview`}
      role="img"
      className={className}
    />
  );
};

export default ArFilterPreview;
