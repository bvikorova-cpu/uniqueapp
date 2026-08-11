/** Download a collectible card artwork as a local image file. */
export async function downloadCardImage(url: string, fileName: string): Promise<void> {
  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "collectible-card";

  const trigger = (href: string, revoke?: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = `${safe}.png`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (revoke) setTimeout(() => URL.revokeObjectURL(revoke), 2000);
  };

  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    trigger(objectUrl, objectUrl);
  } catch {
    // Fallback: open in a new tab so the user can save it manually.
    window.open(url, "_blank", "noopener");
  }
}
