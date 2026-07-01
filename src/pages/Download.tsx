import { useState } from "react";
import { Download as DownloadIcon, FileText, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface DownloadFile {
  name: string;
  description: string;
  url: string;
  size: string;
  type: "pdf" | "zip";
}

const STYLE_FLYERS: DownloadFile[] = [
  { name: "Flyer — Bubble · Kaleidoscope A5 EN 🌀 NEW", description: "Radial mandala of bubbles around a 26-worlds medallion, gold spokes, full section index on the back", url: "/downloads/unique-flyer-a5-en-bubble-kaleidoscope.pdf", size: "1.8 MB", type: "pdf" },
  { name: "Flyer — Bubble · Skyline A5 EN 🏙️ NEW", description: "Bubbles stacked as a photo skyline; 26 worlds indexed on the back", url: "/downloads/unique-flyer-a5-en-bubble-skyline.pdf", size: "3.1 MB", type: "pdf" },
  { name: "Flyer — Bubble · Ribbon A5 EN 🎗️ NEW", description: "S-curved gold ribbon threading photo bubbles across the page + full 26-section index", url: "/downloads/unique-flyer-a5-en-bubble-ribbon.pdf", size: "1.3 MB", type: "pdf" },
  { name: "Flyer — Bubble · Portal A5 EN v3 ✨ LATEST", description: "Clean hero-video still in the center portal, everything shifted up so bottom cards & footer are fully visible", url: "/downloads/unique-flyer-a5-en-bubble-portal-v3.pdf", size: "1.1 MB", type: "pdf" },
  { name: "Flyer — Bubble · Portal A5 EN v2 🌌", description: "Bigger orbit + back-side bubbles, app screenshot in the center portal, full 26-worlds index", url: "/downloads/unique-flyer-a5-en-bubble-portal-v2.pdf", size: "0.8 MB", type: "pdf" },
  { name: "Flyer — Bubble · Portal A5 EN 🌌 NEW", description: "One giant portal bubble with 8 orbiting satellites + 4-feature preview and full index", url: "/downloads/unique-flyer-a5-en-bubble-portal.pdf", size: "2.0 MB", type: "pdf" },
  { name: "Flyer — Bubble · Editorial A5 EN 📖 NEW", description: "Magazine-cover layout: hero bubble, cover story, numbered TOC of all 26 worlds", url: "/downloads/unique-flyer-a5-en-bubble-editorial.pdf", size: "1.3 MB", type: "pdf" },
  { name: "Flyer — Bubble Universe A5 EN 🌟 NEW", description: "Massive gradient Lobster wordmark, photo bubbles, speech-bubble quotes, star bursts — a real showstopper", url: "/downloads/unique-flyer-a5-en-bubble-universe.pdf", size: "8.5 MB", type: "pdf" },
  { name: "Flyer — Bubble · Orbit A5 EN 🪐 NEW", description: "Bubbles orbit a giant hero photo around the wordmark, with orbit rings and gold accents", url: "/downloads/unique-flyer-a5-en-bubble-orbit.pdf", size: "8.8 MB", type: "pdf" },
  { name: "Flyer — Bubble · Waterfall A5 EN 💧 NEW", description: "Cascading diagonal bubble waterfall with a side quote card and gold CTA bar", url: "/downloads/unique-flyer-a5-en-bubble-waterfall.pdf", size: "8.7 MB", type: "pdf" },
  { name: "Flyer — Bubble · Honeycomb A5 EN 🍯 NEW", description: "Dense hexagonal bubble hive of 10 photos, all-gold rings, magazine energy", url: "/downloads/unique-flyer-a5-en-bubble-honeycomb.pdf", size: "8.6 MB", type: "pdf" },
  { name: "Flyer — Bubble · Split Screen A5 EN ⚡ NEW", description: "Photo mosaic left, giant speech-bubble testimonial right, gold divider down the middle", url: "/downloads/unique-flyer-a5-en-bubble-split.pdf", size: "8.7 MB", type: "pdf" },
  { name: "Flyer — Bubble · Constellation A5 EN ✨ NEW", description: "Bubbles as stars connected by gold constellation lines on a deep night sky", url: "/downloads/unique-flyer-a5-en-bubble-constellation.pdf", size: "8.6 MB", type: "pdf" },
  { name: "Flyer — Neon Cyber A5 EN ✨", description: "Neon grid, glow blobs, cyberpunk multiverse vibe", url: "/downloads/unique-flyer-a5-en-neon-cyber.pdf", size: "360 KB", type: "pdf" },
  { name: "Flyer — Midnight Gold A5 EN ✨", description: "Deep purple night sky with gold typography and stars", url: "/downloads/unique-flyer-a5-en-midnight-gold.pdf", size: "130 KB", type: "pdf" },
  { name: "Flyer — Pastel Dream A5 EN ✨", description: "Soft pink/lilac gradient, playful & light", url: "/downloads/unique-flyer-a5-en-pastel-dream.pdf", size: "115 KB", type: "pdf" },
  { name: "Flyer — Editorial Magazine A5 EN ✨", description: "Magazine cover with hero photo, index & feature spread", url: "/downloads/unique-flyer-a5-en-editorial-mag.pdf", size: "210 KB", type: "pdf" },
  { name: "Flyer — Retro 80s A5 EN ✨", description: "Synthwave sun, neon grid horizon, arcade energy", url: "/downloads/unique-flyer-a5-en-retro-80s.pdf", size: "600 KB", type: "pdf" },
  { name: "Flyer — Minimal White A5 EN ✨", description: "Clean Swiss layout, tons of whitespace, purple accent", url: "/downloads/unique-flyer-a5-en-minimal-white.pdf", size: "100 KB", type: "pdf" },
  { name: "Flyer — Comic Pop A5 EN ✨", description: "Halftone yellow, POW/BOOM headers, comic-book fun", url: "/downloads/unique-flyer-a5-en-comic-pop.pdf", size: "265 KB", type: "pdf" },
  { name: "Flyer — Newspaper Classic A5 EN ✨", description: "\"The Unique Times\" front page, serif headlines", url: "/downloads/unique-flyer-a5-en-newspaper-classic.pdf", size: "100 KB", type: "pdf" },
  { name: "Flyer — Blueprint Tech A5 EN ✨", description: "Engineering blueprint aesthetic, cyan on navy", url: "/downloads/unique-flyer-a5-en-blueprint-tech.pdf", size: "460 KB", type: "pdf" },
  { name: "Flyer — Sunset Watercolor A5 EN ✨", description: "Dreamy sunset gradient, soft blurred blobs", url: "/downloads/unique-flyer-a5-en-sunset-watercolor.pdf", size: "145 KB", type: "pdf" },
];

const files: DownloadFile[] = [
  ...STYLE_FLYERS,
  {
    name: "Flyer — Luxury A5 Gradient EN (PDF) ★ NEW",
    description:
      "2-page A5 luxury flyer with real section photos on purple→pink gradient + gold accents",
    url: "/downloads/unique-flyer-luxury-a5-en-v2.pdf",
    size: "2.1 MB",
    type: "pdf",
  },
  {
    name: "Flyer — Luxury A5 Dark Photo EN (PDF) ★ NEW",
    description:
      "2-page A5 luxury flyer with full-page Megatalent/Racing photo background + gold-framed cards",
    url: "/downloads/unique-flyer-luxury-a5-en-photo.pdf",
    size: "1.3 MB",
    type: "pdf",
  },
  {
    name: "Flyer — Luxury Edition EN v1 (A5, PDF)",
    description:
      "Original 2-page A5 luxury flyer (no photos)",
    url: "/downloads/unique-flyer-luxury-a5-en.pdf",
    size: "195 KB",
    type: "pdf",
  },
  {
    name: "Flyer — Visual Edition EN v2 (A4, PDF) ★ recommended",
    description:
      "4-page A4 flyer with Megatalent + Racing backgrounds and all 14 worlds",
    url: "/downloads/unique-letak-visual-en-v2.pdf",
    size: "720 KB",
    type: "pdf",
  },
  {
    name: "Flyer — Visual Edition EN v3 (A5, PDF)",
    description:
      "4-page A5 flyer (print-ready) with section cover images from the app",
    url: "/downloads/unique-letak-visual-en-v3-a5.pdf",
    size: "1.4 MB",
    type: "pdf",
  },
  {
    name: "Flyer — About the Platform EN (PDF)",
    description: "2-page A4 flyer: 14 worlds, 100+ tools",
    url: "/downloads/unique-letak-about-en-v1.pdf",
    size: "70 KB",
    type: "pdf",
  },
  {
    name: "Brochure SK (PDF)",
    description: "Slovak version of the UNIQUE brochure",
    url: "/downloads/brozura-SK.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brochure EN (PDF)",
    description: "English version of UNIQUE brochure",
    url: "/downloads/brozura-EN.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brochure HU (PDF)",
    description: "Hungarian UNIQUE brochure",
    url: "/downloads/brozura-HU.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brochure SK (ZIP)",
    description: "Slovak brochure packed in ZIP",
    url: "/downloads/brozura-SK.zip",
    size: "4.0 MB",
    type: "zip",
  },
  {
    name: "All languages (ZIP)",
    description: "SK + EN + HU brochures in one ZIP archive",
    url: "/downloads/brozury-vsetky-jazyky.zip",
    size: "12 MB",
    type: "zip",
  },
];

export default function Download() {
  const [busy, setBusy] = useState<string | null>(null);

  const handleDownload = async (file: DownloadFile) => {
    const filename = file.url.split("/").pop() || "download";
    setBusy(file.url);
    try {
      const res = await fetch(file.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e) {
      console.error("Download failed", e);
      toast.error("Download failed. Opening in new tab as fallback.");
      window.open(file.url, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Download files
          </h1>
          <p className="text-muted-foreground text-lg">
            Click "Download" to save the file to your device
          </p>
        </div>

        <div className="space-y-4">
          {files.map((file) => {
            const Icon = file.type === "zip" ? Archive : FileText;
            const isBusy = busy === file.url;
            return (
              <Card
                key={file.url}
                className="p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{file.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {file.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{file.size}</p>
                </div>
                <Button
                  className="shrink-0"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <DownloadIcon className="w-4 h-4 mr-2" />
                  )}
                  {isBusy ? "Downloading…" : "Download"}
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Tip: If your browser blocks the download, allow pop-ups for this site
          and try again.
        </p>
      </div>
    </div>
  );
}
