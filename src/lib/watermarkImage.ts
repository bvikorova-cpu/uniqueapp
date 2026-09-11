/**
 * Adds a larger Unique logo + uniqueapp.fun label into the bottom-right corner
 * of a generated image. Users can pay 1 credit to get the clean version.
 */
const LOGO_URLS = ["/unique-icon-v5-192.png", "/unique-icon-v5-512.png", "/unique-icon-v4-192.png"];

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });

let logoCache: HTMLImageElement | null = null;

/** Loads the brand logo once, trying every known icon file. */
async function loadLogo(): Promise<HTMLImageElement | null> {
  if (logoCache) return logoCache;
  for (const url of LOGO_URLS) {
    try {
      logoCache = await loadImage(url);
      return logoCache;
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Drawn fallback so the badge is never missing: gradient square with a white "U". */
function drawLogoFallback(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, "#a21cf0");
  grad.addColorStop(1, "#f0369b");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(size * 0.66)}px Georgia, "Times New Roman", serif`;
  ctx.fillText("U", x + size / 2, y + size * 0.54);
}

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
    const logoSize = Math.round(unit * 0.10);
    const pad = Math.round(unit * 0.035);
    const label = "uniqueapp.fun";

    // Place the logo in the bottom-right corner.
    const logoX = canvas.width - pad - logoSize;
    const logoY = canvas.height - pad - logoSize;

    // Fit the "uniqueapp.fun" label to the left of the logo, same line.
    let fontSize = Math.max(10, Math.round(unit * 0.035));
    let textW = 0;

    ctx.save();
    do {
      ctx.font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      textW = ctx.measureText(label).width;
      if (textW > logoX - pad * 2) fontSize--;
    } while (fontSize > 10 && textW > logoX - pad * 2);

    const textX = logoX - pad;
    const textY = logoY + logoSize / 2;

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Stronger shadow/outline so the bigger badge stays readable on any background.
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = Math.max(3, Math.round(unit * 0.008));
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.fillText(label, textX, textY);

    try {
      const logo = await loadLogo();
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
      if (logo) ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      else drawLogoFallback(ctx, logoX, logoY, logoSize);
      ctx.restore();
    } catch {
      /* never block the export on the badge */
    }
    ctx.restore();

    return canvas.toDataURL("image/png");
  } catch {
    return src;
  }
}
