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
    const logoSize = Math.round(unit * 0.11);
    const pad = Math.round(unit * 0.035);
    const fontSize = Math.max(10, Math.round(unit * 0.032));

    const x = canvas.width - pad - logoSize;
    const y = canvas.height - pad - logoSize - fontSize * 1.35;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = Math.round(unit * 0.012);
    try {
      const logo = await loadImage(LOGO_URL);
      const radius = logoSize * 0.22;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + logoSize, y, x + logoSize, y + logoSize, radius);
      ctx.arcTo(x + logoSize, y + logoSize, x, y + logoSize, radius);
      ctx.arcTo(x, y + logoSize, x, y, radius);
      ctx.arcTo(x, y, x + logoSize, y, radius);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(logo, x, y, logoSize, logoSize);
      ctx.restore();
    } catch {
      /* logo missing — keep the URL label only */
    }

    ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText("uniqueapp.fun", canvas.width - pad, y + logoSize + fontSize * 0.35);
    ctx.restore();

    return canvas.toDataURL("image/png");
  } catch {
    return src;
  }
}
