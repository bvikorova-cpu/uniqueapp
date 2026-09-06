/**
 * Adds a small Unique logo + uniqueapp.fun label into the bottom-right corner
 * of a generated image. Users can pay 1 credit to get the clean version.
 */
const LOGO_URL = "/unique-icon-v5-192.png";

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

    // Vertical pill in the bottom-right corner: URL sits above the logo so text stays higher.
    const boxW = Math.round(Math.max(logoSize * 1.45, textW + logoSize * 0.55));
    const boxH = Math.round(logoSize * 2.25);
    const bx = canvas.width - pad - boxW;
    const by = canvas.height - pad - boxH - Math.round(unit * 0.035);
    const br = boxW / 2;

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

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fillText(label, bx + boxW / 2, by + fontSize * 0.9);

    const logoX = bx + (boxW - logoSize) / 2;
    const logoY = by + boxH - logoSize - Math.round(logoSize * 0.22);
    try {
      const logo = await loadImage(LOGO_URL);
      const radius = logoSize * 0.24;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(logoX + radius, logoY);
      ctx.arcTo(logoX + logoSize, logoY, logoX + logoSize, logoY + logoSize, radius);
      ctx.arcTo(logoX + logoSize, logoY + logoSize, logoX, logoY + logoSize, radius);
      ctx.arcTo(logoX, logoY + logoSize, logoX, logoY, radius);
      ctx.arcTo(logoX, logoY, logoX + logoSize, logoY, radius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch {
      /* logo missing — keep the URL label only */
    }
    ctx.restore();


    return canvas.toDataURL("image/png");
  } catch {
    return src;
  }
}
