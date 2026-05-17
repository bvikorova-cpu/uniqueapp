// Lightweight export helpers for CreativeForge — no extra deps.
// DOCX uses minimal HTML-as-DOC (Word-openable). PDF uses print-to-PDF window.
export function exportAs(
  format: "txt" | "md" | "doc" | "pdf",
  title: string,
  content: string,
) {
  const safeTitle = (title || "creative-forge").replace(/[^a-z0-9-_]+/gi, "-");
  if (format === "txt" || format === "md") {
    const ext = format === "md" ? "md" : "txt";
    const body =
      format === "md" ? `# ${title}\n\n${content}` : content;
    download(body, `${safeTitle}.${ext}`, "text/plain;charset=utf-8");
    return;
  }
  if (format === "doc") {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${escapeHtml(title)}</title></head>
      <body><h1>${escapeHtml(title)}</h1><pre style="font-family:Georgia,serif;white-space:pre-wrap">${escapeHtml(content)}</pre></body></html>`;
    download(html, `${safeTitle}.doc`, "application/msword");
    return;
  }
  if (format === "pdf") {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${escapeHtml(title)}</title>
      <style>body{font-family:Georgia,serif;max-width:780px;margin:40px auto;padding:0 24px;line-height:1.6}
      h1{font-size:28px;margin-bottom:24px}pre{white-space:pre-wrap;font-family:inherit;font-size:15px}</style>
      </head><body><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(content)}</pre>
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    w.document.close();
  }
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
