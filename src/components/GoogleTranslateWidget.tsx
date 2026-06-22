import { useEffect, useState } from "react";
import { Languages, X } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

/**
 * Floating Google Translate widget — collapsed by default into a small
 * glassmorphism icon button. Expands to reveal the language picker.
 * Hidden visually on mobile until tapped, so it never blocks the feed.
 */
export default function GoogleTranslateWidget() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const installTranslateStyles = () => {
    if (document.getElementById("google-translate-style")) return;
    const style = document.createElement("style");
    style.id = "google-translate-style";
    style.innerHTML = `
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      .goog-te-gadget-icon,
      .goog-logo-link,
      .goog-te-gadget > span > a,
      .goog-te-ftab,
      .goog-te-balloon-frame,
      #goog-gt-tt,
      .goog-te-spinner-pos,
      .goog-te-menu,
      .VIpgJd-ZVi9od-ORHb-OEVmcd {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        pointer-events: none !important;
      }
      body, html {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .skiptranslate { display: none !important; }
      #google_translate_element .goog-te-gadget {
        color: transparent !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }
      #google_translate_element .goog-te-gadget .goog-te-combo {
        color: hsl(var(--foreground));
        background: hsl(var(--background) / 0.95);
        border: 1px solid hsl(var(--border));
        border-radius: 9999px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        outline: none;
        box-shadow: 0 8px 24px hsl(270 91% 58% / 0.25);
        max-width: min(76vw, 220px);
      }
      #google_translate_element .goog-te-gadget .goog-te-combo:focus {
        border-color: hsl(var(--primary));
      }
      iframe.VIpgJd-ZVi9od-xl07Ob-OEVmcd.skiptranslate,
      iframe.goog-te-menu-frame {
        width: calc(100vw - 12px) !important;
        max-width: calc(100vw - 12px) !important;
        min-width: 0 !important;
        left: 6px !important;
        right: 6px !important;
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
        box-shadow: 0 12px 32px rgba(0,0,0,0.25);
        border-radius: 12px;
      }
    `;
    document.head.appendChild(style);
  };

  // Defer the 122 KiB translate.google.com script until the user actually
  // opens the widget. Loading it eagerly cost ~7 s on PageSpeed mobile.
  useEffect(() => {
    if (!open || loaded) return;
    installTranslateStyles();
    if (document.getElementById("google-translate-script")) {
      setLoaded(true);
      return;
    }

    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          },
          "google_translate_element"
        );
      } catch {}
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
    setLoaded(true);
  }, [open, loaded]);

  // Aggressively remove Google Translate banners / panels and reset body
  // styles so the top app header is never pushed down.
  useEffect(() => {
    if (!loaded) return;

    const killTranslateUI = () => {
      const banner = document.querySelector(
        ".goog-te-banner-frame, .goog-te-banner-frame.skiptranslate"
      ) as HTMLElement | null;
      if (banner) {
        banner.style.display = "none";
        banner.style.visibility = "hidden";
        banner.style.height = "0";
        banner.style.width = "0";
        banner.remove();
      }
      const bottomPanel = document.querySelector(
        ".goog-te-ftab, .goog-te-balloon-frame, #goog-gt-tt, .VIpgJd-ZVi9od-ORHb-OEVmcd"
      ) as HTMLElement | null;
      if (bottomPanel) {
        bottomPanel.style.display = "none";
        bottomPanel.style.visibility = "hidden";
        bottomPanel.remove();
      }
      if (document.body) {
        document.body.style.top = "0px";
        document.body.style.position = "static";
        document.body.style.marginTop = "0px";
        document.body.style.paddingTop = "0px";
      }
      if (document.documentElement) {
        document.documentElement.style.top = "0px";
        document.documentElement.style.position = "static";
      }
    };

    killTranslateUI();

    const observer = new MutationObserver(() => killTranslateUI());
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = window.setInterval(killTranslateUI, 500);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [loaded]);

  return (
    <div className="fixed bottom-[calc(9rem+env(safe-area-inset-bottom))] right-3 md:bottom-24 md:right-6 z-[9999] flex items-center gap-2">
      <div
        id="google_translate_element"
        aria-label="Translate page"
        className={`transition-all duration-300 ${
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-4 pointer-events-none w-0 overflow-hidden"
        }`}
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide translator" : "Translate page"}
        className="h-10 w-10 rounded-full flex items-center justify-center bg-background/60 hover:bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-primary/20 text-foreground/80 hover:text-primary transition-all active:scale-95"
      >
        {open ? <X className="h-4 w-4" /> : <Languages className="h-4 w-4" />}
      </button>
    </div>
  );
}
