/**
 * Adds a small Unique logo + uniqueapp.fun label into the bottom-right corner
 * of a generated image. Users can pay 1 credit to get the clean version.
 */
const LOGO_URL = "/unique-icon-v4-192.png";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });

export async function addUniqueWatermark(src: string): Promise<string> {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const unit = Math.min(canvas.width, canvas.height);
    const logoSize = Math.round(unit * 0.07);
    const pad = Math.round(unit * 0.028);
    const fontSize = Math.max(9, Math.round(unit * 0.026));
    const gap = Math.round(logoSize * 0.35);

    ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    const label = "uniqueapp.fun";
    const textW = ctx.measureText(label).width;

    // Compact horizontal pill in the bottom-left corner so it never sits on the artwork text.
    const boxH = Math.round(logoSize * 1.34);
    const boxW = Math.round(logoSize + gap + textW + logoSize * 0.6);
    const bx = pad;
    const by = canvas.height - pad - boxH;
    const br = boxH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.arcTo(bx + boxW, by, bx + boxW, by + boxH, br);
    ctx.arcTo(bx + boxW, by + boxH, bx, by + boxH, br);
    ctx.arcTo(bx, by + boxH, bx, by, br);
    ctx.arcTo(bx, by, bx + boxW, by, br);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fill();

    const x = bx + Math.round((boxH - logoSize) / 2);
    const y = by + Math.round((boxH - logoSize) / 2);
    try {
      const logo = await loadImage(LOGO_URL);
      const radius = logoSize * 0.24;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + logoSize, y, x + logoSize, y + logoSize, radius);
      ctx.arcTo(x + logoSize, y + logoSize, x, y + logoSize, radius);
      ctx.arcTo(x, y + logoSize, x, y, radius);
      ctx.arcTo(x, y, x + logoSize, y, radius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logo, x, y, logoSize, logoSize);
      ctx.restore();
    } catch {
      /* logo missing — keep the URL label only */
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fillText(label, x + logoSize + gap, by + boxH / 2 + 1);
    ctx.restore();


    return canvas.toDataURL("image/png");
  } catch {
    return src;
  }
}
