/**
 * Keeps the brand name "Unique" untranslated by machine translators
 * (Chrome / Google Translate) by wrapping every standalone occurrence in a
 * <span translate="no" class="notranslate"> element.
 */

const BRAND = /\bUnique\b/;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

function isProtected(el: Element | null): boolean {
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.getAttribute?.("translate") === "no") return true;
    if (el.classList?.contains("notranslate")) return true;
    el = el.parentElement;
  }
  return false;
}

function wrapTextNode(node: Text) {
  const text = node.nodeValue ?? "";
  if (!BRAND.test(text)) return;
  const parts = text.split(/(\bUnique\b)/g);
  if (parts.length < 2) return;
  const frag = document.createDocumentFragment();
  for (const part of parts) {
    if (!part) continue;
    if (part === "Unique") {
      const span = document.createElement("span");
      span.setAttribute("translate", "no");
      span.className = "notranslate";
      span.textContent = part;
      frag.appendChild(span);
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  }
  node.parentNode?.replaceChild(frag, node);
}

function scan(root: Node) {
  if (!(root instanceof Element) && root.nodeType !== Node.TEXT_NODE) return;
  if (root.nodeType === Node.TEXT_NODE) {
    if (!isProtected((root as Text).parentElement)) wrapTextNode(root as Text);
    return;
  }
  const el = root as Element;
  if (isProtected(el)) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const t = current as Text;
    if (BRAND.test(t.nodeValue ?? "") && !isProtected(t.parentElement)) targets.push(t);
    current = walker.nextNode();
  }
  targets.forEach(wrapTextNode);
}

export function protectBrandName() {
  if (typeof document === "undefined") return;
  let queued = false;
  const run = () => {
    queued = false;
    try {
      scan(document.body);
    } catch {}
  };

  const start = () => {
    run();
    const observer = new MutationObserver((mutations) => {
      if (queued) return;
      for (const m of mutations) {
        if (m.addedNodes.length || m.type === "characterData") {
          queued = true;
          requestAnimationFrame(run);
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
