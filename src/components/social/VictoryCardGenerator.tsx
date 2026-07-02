import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Share2, Trophy, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface VictoryCardGeneratorProps {
  defaultTitle?: string;
  defaultSubtitle?: string;
  defaultAmount?: string;
  username?: string | null;
  avatarUrl?: string | null;
}

/**
 * Generates a shareable PNG "victory card" — for social bragging & viral growth.
 * Renders an SVG-to-canvas pipeline (no extra deps).
 */
export function VictoryCardGenerator({
  defaultTitle = "I just won on Unique!",
  defaultSubtitle = "Join me and try your luck",
  defaultAmount = "€500",
  username,
  avatarUrl,
}: VictoryCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState(defaultTitle);
  const [amount, setAmount] = useState(defaultAmount);
  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?ref=${(username || "friend").slice(0, 8).toUpperCase()}`
    : "";

  const renderCard = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;

    // gradient bg
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#7c3aed");
    grad.addColorStop(0.5, "#db2777");
    grad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // dark overlay
    ctx.fillStyle = "rgba(15, 5, 30, 0.55)";
    ctx.fillRect(0, 0, W, H);

    // glow circle
    const glow = ctx.createRadialGradient(W/2, 380, 50, W/2, 380, 400);
    glow.addColorStop(0, "rgba(245, 158, 11, 0.6)");
    glow.addColorStop(1, "rgba(245, 158, 11, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // top label
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⭐ UNIQUE WIN ⭐", W/2, 120);

    // amount big
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 220px sans-serif";
    ctx.fillText(amount, W/2, 460);

    // title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px sans-serif";
    const wrapped = wrapText(ctx, title, W - 120, 56);
    wrapped.forEach((line, i) => ctx.fillText(line, W/2, 580 + i * 70));

    // subtitle
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "32px sans-serif";
    ctx.fillText(subtitle, W/2, 800);

    // username
    if (username) {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(`@${username}`, W/2, 880);
    }

    // CTA pill
    const pillW = 600, pillH = 90, pillX = (W - pillW)/2, pillY = 940;
    ctx.fillStyle = "#fbbf24";
    roundRect(ctx, pillX, pillY, pillW, pillH, 45);
    ctx.fill();
    ctx.fillStyle = "#0a0a1a";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("uniqueapp.fun · Try your luck →", W/2, pillY + 58);

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.95));
  };

  const download = async () => {
    setGenerating(true);
    try {
      const blob = await renderCard();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `unique-win-${Date.now()}.png`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("Victory card downloaded!");
    } finally { setGenerating(false); }
  };

  const share = async () => {
    setGenerating(true);
    try {
      const blob = await renderCard();
      if (!blob) return;
      const file = new File([blob], "unique-win.png", { type: "image/png" });
      const text = `${title} ${amount} on Unique! Join me: ${shareUrl}`;

      // Web Share API is blocked in iframes (e.g. Lovable preview) — detect & fallback
      const inIframe = typeof window !== "undefined" && window.self !== window.top;

      try {
        if (!inIframe && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text, title: "Unique Win" });
          return;
        }
        if (!inIframe && navigator.share) {
          await navigator.share({ text, url: shareUrl, title });
          return;
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return; // user cancelled
        // otherwise fall through to clipboard fallback
      }

      // Fallback: copy text+link to clipboard
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Link copied — paste it on social media!", {
          description: inIframe ? "Native share works on the live app (uniqueapp.fun)." : undefined,
        });
      } catch {
        toast.error("Couldn't share — try Save to download the image.");
      }
    } finally { setGenerating(false); }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-primary/30">
      <FloatingHowItWorks
        title={"Victory Card Generator"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Share Your Victory
          <Sparkles className="h-4 w-4 text-pink-500 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* preview */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 relative flex flex-col items-center justify-center text-white p-6 shadow-2xl shadow-primary/40"
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center space-y-2">
            <p className="text-xs opacity-80 tracking-widest">⭐ UNIQUE WIN ⭐</p>
            <p className="text-6xl font-black text-yellow-400">{amount}</p>
            <p className="text-lg font-bold">{title}</p>
            <p className="text-xs opacity-80">{subtitle}</p>
            {username && <p className="text-sm font-bold opacity-90">@{username}</p>}
            <div className="mt-3 px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold inline-block">
              uniqueapp.fun · Try your luck →
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="€500" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        </div>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle" />

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={download} disabled={generating} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Save
          </Button>
          <Button onClick={share} disabled={generating} className="gap-2 bg-gradient-to-r from-primary to-accent">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button onClick={copyLink} variant="outline" className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Link"}
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, _size: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default VictoryCardGenerator;
