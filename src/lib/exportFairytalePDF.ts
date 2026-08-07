import jsPDF from "jspdf";

type Page = { text: string; scene?: string; image?: string };

/** Fetch any image URL (remote or data URL) as a PNG/JPEG data URL for jsPDF. */
async function toDataUrl(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    let dataUrl = url;
    if (!url.startsWith("data:")) {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
    }
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { data: dataUrl, ...dims };
  } catch {
    return null;
  }
}

/** Renders the whole fairytale (cover + every page, text and illustrations) into one PDF. */
export async function exportFairytaleToPDF(opts: {
  title: string;
  childName: string;
  cover?: string | null;
  pages: Page[];
}) {
  const { title, childName, cover, pages } = opts;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  const drawImage = (img: { data: string; w: number; h: number }, y: number, maxH: number) => {
    const ratio = Math.min(contentW / img.w, maxH / img.h);
    const w = img.w * ratio;
    const h = img.h * ratio;
    const x = (pageW - w) / 2;
    doc.addImage(img.data, "JPEG", x, y, w, h, undefined, "FAST");
    return y + h;
  };

  // ---- Cover page ----
  doc.setFillColor(120, 50, 200);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(title, contentW);
  let y = margin + 40;
  titleLines.forEach((line: string) => {
    doc.text(line, pageW / 2, y, { align: "center" });
    y += 34;
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(`A fairytale for ${childName}`, pageW / 2, y + 6, { align: "center" });
  y += 40;

  const coverImg = cover ? await toDataUrl(cover) : null;
  if (coverImg) drawImage(coverImg, y, pageH - y - margin - 30);

  doc.setFontSize(10);
  doc.setTextColor(240, 230, 255);
  doc.text("Unique · AI storybook", pageW / 2, pageH - 28, { align: "center" });

  // ---- Story pages ----
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    doc.addPage();
    doc.setTextColor(120, 50, 200);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Page ${i + 1}`, margin, margin);

    let cy = margin + 18;
    if (p.image) {
      const img = await toDataUrl(p.image);
      if (img) cy = drawImage(img, cy, pageH * 0.5) + 24;
    }

    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    const lines = doc.splitTextToSize(p.text ?? "", contentW);
    for (const line of lines) {
      if (cy > pageH - margin) {
        doc.addPage();
        cy = margin;
      }
      doc.text(line, margin, cy);
      cy += 19;
    }

    doc.setFontSize(9);
    doc.setTextColor(170, 170, 170);
    doc.text(`${title} · ${i + 1} / ${pages.length}`, pageW / 2, pageH - 22, { align: "center" });
  }

  const safe = (title || "fairytale").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`${safe || "fairytale"}-book.pdf`);
}
