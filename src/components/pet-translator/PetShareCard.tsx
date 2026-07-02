import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { petName: string; emotion?: string; quote: string; species?: string; }

export default function PetShareCard({ petName, emotion, quote, species = "dog" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const exportPNG = async () => {
    const node = ref.current; if (!node) return;
    const w = 1080, h = 1080;
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    // gradient bg
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#a855f7"); grad.addColorStop(1, "#ec4899");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "white"; ctx.textAlign = "center";
    ctx.font = "bold 64px sans-serif"; ctx.fillText(petName, w / 2, 200);
    if (emotion) { ctx.font = "48px sans-serif"; ctx.fillText(emotion, w / 2, 290); }
    // wrap quote
    ctx.font = "italic 56px sans-serif";
    const words = quote.split(" "); let line = ""; let y = 480; const max = w - 160;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > max) { ctx.fillText(`"${line.trim()}"`, w/2, y); line = word + " "; y += 80; }
      else line = test;
    }
    if (line) ctx.fillText(`"${line.trim()}"`, w/2, y);
    ctx.font = "32px sans-serif"; ctx.globalAlpha = 0.8; ctx.fillText(`— translated by Unique Pet Translator`, w/2, h - 80);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `${petName}-translation.png`; a.click();
    toast.success("Saved!");
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title: `${petName} says...`, text: `"${quote}" — ${petName} 🐾` });
    else { navigator.clipboard.writeText(`"${quote}" — ${petName} 🐾`); toast.success("Copied"); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Share Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Card className="p-4">
      <div ref={ref} className="rounded-lg p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-center mb-3">
        <div className="text-2xl font-bold">{petName} {species === "cat" ? "🐱" : species === "dog" ? "🐶" : "🐾"}</div>
        {emotion && <div className="text-sm mt-1 opacity-90">{emotion}</div>}
        <div className="text-xl italic mt-3">"{quote}"</div>
      </div>
      <div className="flex gap-2">
        <Button onClick={exportPNG} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" />Save PNG</Button>
        <Button onClick={share} className="flex-1"><Share2 className="w-4 h-4 mr-1" />Share</Button>
      </div>
    </Card>
    </>
    );
}
