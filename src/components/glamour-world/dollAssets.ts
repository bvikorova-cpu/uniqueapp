// Layered paper-doll asset kit — all layers are pixel-aligned (512×853).
import outfitBallgown from "@/assets/dollkit/outfit_ballgown.png";
import outfitMinidress from "@/assets/dollkit/outfit_minidress.png";
import outfitMermaid from "@/assets/dollkit/outfit_mermaid.png";
import outfitAline from "@/assets/dollkit/outfit_aline.png";
import outfitJumpsuit from "@/assets/dollkit/outfit_jumpsuit.png";
import outfitJeans from "@/assets/dollkit/outfit_casual_jeans.png";
import outfitSkirt from "@/assets/dollkit/outfit_skirt_blouse.png";
import outfitSporty from "@/assets/dollkit/outfit_sporty.png";

import hairLongStraight from "@/assets/dollkit/hair_long_straight.png";
import hairLongWavy from "@/assets/dollkit/hair_long_wavy.png";
import hairBob from "@/assets/dollkit/hair_bob.png";
import hairPonytail from "@/assets/dollkit/hair_ponytail.png";
import hairBun from "@/assets/dollkit/hair_bun.png";
import hairCurly from "@/assets/dollkit/hair_curly.png";

import accTiara from "@/assets/dollkit/acc_tiara.png";
import accNecklace from "@/assets/dollkit/acc_necklace.png";
import accSunglasses from "@/assets/dollkit/acc_sunglasses.png";
import accHandbag from "@/assets/dollkit/acc_handbag.png";

export const DOLL_W = 512;
export const DOLL_H = 853;

/** Reference colors baked into the generated artwork. */
export const REF_SKIN: [number, number, number] = [247, 217, 196];
export const REF_HAIR: [number, number, number] = [98, 63, 40];

export const OUTFIT_LAYERS: Record<string, string> = {
  "Ball Gown": outfitBallgown,
  "Mini Dress": outfitMinidress,
  Mermaid: outfitMermaid,
  "A-Line": outfitAline,
  Jumpsuit: outfitJumpsuit,
  "Casual Jeans": outfitJeans,
  "Skirt & Blouse": outfitSkirt,
  Sporty: outfitSporty,
};

export const HAIR_LAYERS: Record<string, string> = {
  "Long Straight": hairLongStraight,
  "Long Wavy": hairLongWavy,
  Bob: hairBob,
  Ponytail: hairPonytail,
  Bun: hairBun,
  Curly: hairCurly,
};

export const ACCESSORY_LAYERS: Record<string, string> = {
  Tiara: accTiara,
  Necklace: accNecklace,
  Sunglasses: accSunglasses,
  Handbag: accHandbag,
};

export const OUTFIT_STYLES = Object.keys(OUTFIT_LAYERS);
export const HAIR_STYLES = Object.keys(HAIR_LAYERS);
export const ACCESSORY_STYLES = ["None", ...Object.keys(ACCESSORY_LAYERS)];

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Cheap RGB → HSV (h in degrees, s/v in 0..1). */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const mx = Math.max(rn, gn, bn);
  const mn = Math.min(rn, gn, bn);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === rn) h = ((gn - bn) / d) % 6;
    else if (mx === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, mx > 0 ? d / mx : 0, mx];
}

/** Converts HSV (h in degrees, s/v 0..1) back to RGB 0..255. */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return [clamp((r + m) * 255), clamp((g + m) * 255), clamp((b + m) * 255)];
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Recolors skin pixels and white fabric pixels in place. */
export function tintDollBody(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  skin: [number, number, number],
  fabric: [number, number, number] | null,
  _shoe: [number, number, number] | null,
) {
  const headEnd = Math.round(height * 0.22);
  const skinRatio = [skin[0] / REF_SKIN[0], skin[1] / REF_SKIN[1], skin[2] / REF_SKIN[2]];
  const [fh, fs] = fabric ? rgbToHsv(fabric[0], fabric[1], fabric[2]) : [0, 0, 0];
  const fabricV = fabric ? Math.max(fabric[0], Math.max(fabric[1], fabric[2])) / 255 : 1;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [h, s, v] = rgbToHsv(r, g, b);

    // Skin: warm, moderately saturated, bright.
    if (h >= 12 && h <= 48 && s >= 0.1 && s <= 0.55 && v >= 0.55) {
      data[i] = clamp(r * skinRatio[0]);
      data[i + 1] = clamp(g * skinRatio[1]);
      data[i + 2] = clamp(b * skinRatio[2]);
      continue;
    }

    // Neutral bright pixels below the head = white garment fabric (incl. shoes).
    if (fabric && s <= 0.16 && v >= 0.62) {
      const y = Math.floor(i / 4 / width);
      if (y < headEnd) continue; // keep eye whites intact
      // Keep the artwork's own shading by scaling the target value with it.
      const shade = 0.55 + 0.45 * v;
      const [nr, ng, nb] = hsvToRgb(fh, fs, Math.min(1, fabricV * shade));
      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }
  }
}

/** Recolors an extracted hair layer, keeping the artwork's shading. */
export function tintHair(data: Uint8ClampedArray, hair: [number, number, number]) {
  const [th, ts, tv] = rgbToHsv(hair[0], hair[1], hair[2]);
  const [, , refV] = rgbToHsv(REF_HAIR[0], REF_HAIR[1], REF_HAIR[2]);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const [, , v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    // relative luminance of this pixel vs the reference hair tone
    const shade = Math.min(1.6, v / (refV || 0.5));
    const [nr, ng, nb] = hsvToRgb(th, ts, Math.min(1, tv * (0.55 + 0.45 * shade)));
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadDollImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}
