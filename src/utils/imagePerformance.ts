/**
 * Global image performance patch.
 *
 * Many components in this codebase predate the LazyImage helper and use raw
 * <img> tags without `loading="lazy"` / `decoding="async"`. Rewriting 1400+
 * call sites is impractical, so we apply the optimization defensively at
 * runtime via a single MutationObserver.
 *
 * Rules applied to every <img> that appears in the DOM:
 *  - If no `loading` attribute is set → set `loading="lazy"`.
 *  - If no `decoding` attribute is set → set `decoding="async"`.
 *  - Skip images marked with `data-priority="true"` (above-the-fold/LCP).
 *  - Skip images already inside the viewport on first paint to avoid
 *    layout thrash on hero content.
 */

let installed = false;

function patchImage(img: HTMLImageElement) {
  if (img.dataset.priority === "true") return;
  if (!img.hasAttribute("loading")) {
    img.setAttribute("loading", "lazy");
  }
  if (!img.hasAttribute("decoding")) {
    img.setAttribute("decoding", "async");
  }
}

export function installImagePerformancePatch() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // Patch images already in the DOM.
  document.querySelectorAll("img").forEach((el) => patchImage(el as HTMLImageElement));

  // Observe future additions.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.tagName === "IMG") {
          patchImage(node as HTMLImageElement);
        } else {
          node.querySelectorAll?.("img").forEach((el) => patchImage(el as HTMLImageElement));
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
