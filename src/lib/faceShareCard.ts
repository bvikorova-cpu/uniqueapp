import { downloadImage } from "@/utils/downloadImage";

/** Builds a shareable result card (PNG) from a Face Insight report. */
export async function downloadFaceShareCard(opts: {
  headline: string;
  summary: string;
  scores: Record<string, number>;
  photo?: string | null;
}): Promise<"shared" | "downloaded" | "cancelled" | "opened"> {
  const { headline, summary, scores, photo } = opts;
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported on this device.");

  const wrap = (text: string, cx: number, startY: number, maxW: number, lh: number) => {
    const words = String(text || "").split(/\s+/);
    let line = "";
    let y = startY;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, y);
        line = word;
        y += lh;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, cx, y);
      y += lh;
    }
    return y;
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const img = photo ? await loadImage(photo) : null;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#2b0a53");
  grad.addColorStop(0.55, "#6d28d9");
  grad.addColorStop(1, "#db2777");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (img) {
    const size = 420;
    const y = 150;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const ratio = Math.max(size / img.width, size / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    ctx.drawImage(img, W / 2 - w / 2, y + size / 2 - h / 2, w, h);
    ctx.restore();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(W / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Georgia, serif";
  ctx.fillText("Face Insight Studio", W / 2, 100);

  ctx.font = "bold 58px Georgia, serif";
  wrap(headline, W / 2, 660, W - 140, 66);

  ctx.font = "28px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  const afterSummary = wrap(summary, W / 2, 780, W - 180, 38);

  // Score bars
  let y = Math.max(afterSummary + 40, 880);
  const entries = Object.entries(scores || {}).slice(0, 5);
  for (const [key, value] of entries) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    ctx.textAlign = "left";
    ctx.font = "26px Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(key.replace(/_/g, " "), 110, y);
    ctx.textAlign = "right";
    ctx.fillText(`${pct}`, W - 110, y);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(110, y + 12, W - 220, 14);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(110, y + 12, ((W - 220) * pct) / 100, 14);
    y += 70;
  }

  ctx.textAlign = "center";
  ctx.font = "bold 30px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("uniqueapp.fun", W / 2, H - 70);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png")
  );
  const fileName = `face-insight-card-${Date.now()}.png`;

  // Prefer the native share sheet (any device that supports file sharing).
  if (blob) {
    const file = new File([blob], fileName, { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
      share?: (data: unknown) => Promise<void>;
    };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: "Face Insight Studio" });
        return "shared";
      } catch (e: any) {
        if (e?.name === "AbortError") return "cancelled";
      }
    }
  }

  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png");
  try {
    return await downloadImage(url, fileName);
  } finally {
    if (blob) setTimeout(() => URL.revokeObjectURL(url), 15000);
  }
}

