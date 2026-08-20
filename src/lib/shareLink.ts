/** Robust share helper: Web Share API -> clipboard -> legacy copy -> prompt fallback. */
export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function shareLink(opts: { title: string; text: string; url: string }): Promise<ShareResult> {
  const { title, text, url } = opts;
  const payload = `${text} ${url}`.trim();

  // 1) Native share sheet (mobile). Skipped when unavailable or blocked in iframe.
  const canNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (typeof navigator.canShare !== "function" || navigator.canShare({ title, text, url }));

  if (canNativeShare) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (e) {
      const name = (e as { name?: string } | undefined)?.name;
      if (name === "AbortError") return "cancelled";
      // NotAllowedError (iframe/permission) -> continue to clipboard fallback
    }
  }

  // 2) Async clipboard
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload);
      return "copied";
    }
  } catch {
    // fall through
  }

  // 3) Legacy copy
  if (legacyCopy(payload)) return "copied";

  return "failed";
}
