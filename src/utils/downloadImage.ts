// Download a generated image on both desktop and mobile browsers.
// Mobile Safari/Chrome often ignore the anchor "download" attribute for remote
// URLs, so we fetch a blob first and fall back to the native share sheet.
export const downloadImage = async (src: string, fileName = `unique-${Date.now()}.png`) => {
  const triggerAnchor = (href: string, revoke?: boolean) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (revoke) setTimeout(() => URL.revokeObjectURL(href), 10000);
  };

  try {
    let blob: Blob;
    if (src.startsWith("data:")) {
      blob = await (await fetch(src)).blob();
    } else {
      const res = await fetch(src, { mode: "cors" });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      blob = await res.blob();
    }

    const file = new File([blob], fileName, { type: blob.type || "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
      share?: (data: unknown) => Promise<void>;
    };

    // On phones the share sheet is the reliable "save to photos" path.
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && nav.canShare?.({ files: [file] }) && nav.share) {
      try {
        await nav.share({ files: [file], title: fileName });
        return "shared" as const;
      } catch (e: any) {
        if (e?.name === "AbortError") return "cancelled" as const;
      }
    }

    triggerAnchor(URL.createObjectURL(blob), true);
    return "downloaded" as const;
  } catch {
    // Last resort: open in a new tab so the user can long-press / right-click save.
    window.open(src, "_blank", "noopener");
    return "opened" as const;
  }
};
