import { useEffect } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

/**
 * Floating Google Translate widget — lets users translate the entire app
 * into any language supported by Google Translate. Mounted once globally.
 */
export default function GoogleTranslateWidget() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      } catch {}
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);

    // Hide Google's top banner that pushes the page down
    const style = document.createElement("style");
    style.id = "google-translate-style";
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
      body { top: 0 !important; }
      #google_translate_element .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
      #google_translate_element .goog-te-gadget .goog-te-combo {
        color: hsl(var(--foreground));
        background: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 9999px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px hsl(270 91% 58% / 0.2);
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      id="google_translate_element"
      className="fixed bottom-4 right-4 z-[9999] backdrop-blur-md bg-background/70 rounded-full px-2 py-1 border border-border/50 shadow-lg"
      aria-label="Translate page"
    />
  );
}
