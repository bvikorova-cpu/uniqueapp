import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ACCESSORY_LAYERS,
  DOLL_H,
  DOLL_W,
  HAIR_LAYERS,
  OUTFIT_LAYERS,
  hexToRgb,
  loadDollImage,
  tintDollBody,
  tintHair,
} from "./dollAssets";

export interface DollLook {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  dressColor: string;
  dressStyle: string;
  shoeColor: string;
  accessory: string;
}

/**
 * Layered paper-doll renderer: body+outfit artwork, tinted hair layer and an
 * optional accessory layer, all composited on a canvas at native resolution.
 */
export function DollIllustration({ look }: { look: DollLook }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outfitSrc = OUTFIT_LAYERS[look.dressStyle] ?? Object.values(OUTFIT_LAYERS)[0];
    const hairSrc = HAIR_LAYERS[look.hairStyle] ?? Object.values(HAIR_LAYERS)[0];
    const accSrc = look.accessory !== "None" ? ACCESSORY_LAYERS[look.accessory] : undefined;

    setLoading(true);

    (async () => {
      const [outfitImg, hairImg, accImg] = await Promise.all([
        loadDollImage(outfitSrc),
        loadDollImage(hairSrc),
        accSrc ? loadDollImage(accSrc) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      const skin = hexToRgb(look.skinColor);
      const fabric = hexToRgb(look.dressColor);
      const shoe = hexToRgb(look.shoeColor);
      const hair = hexToRgb(look.hairColor);

      ctx.clearRect(0, 0, DOLL_W, DOLL_H);

      const work = document.createElement("canvas");
      work.width = DOLL_W;
      work.height = DOLL_H;
      const wctx = work.getContext("2d");
      if (!wctx) return;

      // Body + outfit (skin, fabric and shoes recolored)
      wctx.clearRect(0, 0, DOLL_W, DOLL_H);
      wctx.drawImage(outfitImg, 0, 0, DOLL_W, DOLL_H);
      const bodyData = wctx.getImageData(0, 0, DOLL_W, DOLL_H);
      tintDollBody(bodyData.data, DOLL_W, DOLL_H, skin, fabric, shoe);
      wctx.putImageData(bodyData, 0, 0);
      ctx.drawImage(work, 0, 0);

      // Hair
      wctx.clearRect(0, 0, DOLL_W, DOLL_H);
      wctx.drawImage(hairImg, 0, 0, DOLL_W, DOLL_H);
      const hairData = wctx.getImageData(0, 0, DOLL_W, DOLL_H);
      tintHair(hairData.data, hair);
      wctx.putImageData(hairData, 0, 0);
      ctx.drawImage(work, 0, 0);

      // Accessory (kept in its original metal / lens colors)
      if (accImg) ctx.drawImage(accImg, 0, 0, DOLL_W, DOLL_H);

      setLoading(false);
    })().catch(() => setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [look]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        width={DOLL_W}
        height={DOLL_H}
        aria-label="Preview of your custom fashion doll"
        className="max-h-full max-w-full object-contain drop-shadow-[0_12px_24px_rgba(219,39,119,0.25)]"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-pink-500" />
        </div>
      )}
    </div>
  );
}
