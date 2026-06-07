import DOMPurify from "dompurify";

/**
 * Sanitize HTML before injecting via dangerouslySetInnerHTML.
 * Use for any string that originated from user input, AI output, or external sources.
 *
 * Allows a conservative subset of formatting tags + class attribute for our markdown
 * renderer. NO <script>, <iframe>, <object>, on* handlers, javascript: URLs, etc.
 */
export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "u", "s", "br", "p", "span", "div",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "a", "code", "pre", "blockquote", "hr",
    ],
    ALLOWED_ATTR: ["class", "href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });

/**
 * Simple text-only escape — converts \n to <br/> after escaping HTML entities.
 * Use when you only need line breaks, not full markdown.
 */
export const escapeWithLineBreaks = (text: string): string => {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped.replace(/\n/g, "<br/>");
};
