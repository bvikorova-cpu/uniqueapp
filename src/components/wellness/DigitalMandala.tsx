import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Palette, Sparkles, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const COLOR_PALETTES = {
  "Cosmic": ["#8B5CF6", "#EC4899", "#3B82F6", "#6366F1", "#A855F7", "#F472B6"],
  "Nature": ["#10B981", "#34D399", "#059669", "#047857", "#84CC16", "#22C55E"],
  "Sunset": ["#F59E0B", "#EF4444", "#F97316", "#DC2626", "#FBBF24", "#FB923C"],
  "Ocean": ["#0EA5E9", "#06B6D4", "#0284C7", "#0369A1", "#38BDF8", "#67E8F9"],
};

export function DigitalMandala() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#8B5CF6");
  const [brushSize, setBrushSize] = useState(3);
  const [symmetry, setSymmetry] = useState(8);
  const [activePalette, setActivePalette] = useState<string>("Cosmic");
  const [strokeCount, setStrokeCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 600;
    canvas.height = 600;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw guide circles
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    [50, 100, 150, 200, 250].forEach(r => {
      ctx.beginPath();
      ctx.arc(300, 300, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, []);

  const drawSymmetricalPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angle = (2 * Math.PI) / symmetry;
    for (let i = 0; i < symmetry; i++) {
      const rad = angle * i;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const localX = x - centerX;
      const localY = y - centerY;
      const rotatedX = localX * cos - localY * sin + centerX;
      const rotatedY = localX * sin + localY * cos + centerY;
      // Draw with glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = brushSize * 2;
      ctx.beginPath();
      ctx.arc(rotatedX, rotatedY, brushSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scaleX = 600 / rect.width;
    const scaleY = 600 / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPos(e);
    if (pos) drawSymmetricalPoint(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    if (pos) drawSymmetricalPoint(pos.x, pos.y);
  };

  const handleEnd = () => {
    if (isDrawing) setStrokeCount(c => c + 1);
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    [50, 100, 150, 200, 250].forEach(r => {
      ctx.beginPath();
      ctx.arc(300, 300, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    setStrokeCount(0);
    toast({ title: "Canvas cleared", description: "Start creating your new mandala" });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `mandala-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "Mandala saved!", description: "Your creation has been downloaded" });
  };

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="DigitalMandala — How it works" steps={[{title:"Open this tool",desc:"Access DigitalMandala within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-primary/5 to-pink-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10">
            <Palette className="w-5 h-5 text-violet-400" />
          </div>
          Digital Mandala Creator
          {strokeCount > 0 && (
            <Badge variant="outline" className="text-xs ml-2">{strokeCount} strokes</Badge>
          )}
        </CardTitle>
        <CardDescription>Create meditative symmetrical art for mindful focus and creative relaxation</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Color Palettes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <label className="text-xs font-semibold text-muted-foreground">Color Palette</label>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(COLOR_PALETTES).map(([name, colors]) => (
              <Button
                key={name}
                variant={activePalette === name ? "default" : "outline"}
                size="sm"
                className="text-xs h-auto py-1.5"
                onClick={() => { setActivePalette(name); setColor(colors[0]); }}
              >
                <div className="flex gap-0.5 mr-1.5">
                  {colors.slice(0, 3).map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {name}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {COLOR_PALETTES[activePalette as keyof typeof COLOR_PALETTES].map((c) => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all shadow-lg ${
                  color === c ? "border-foreground scale-110 ring-2 ring-primary/30" : "border-border/50"
                }`}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 12px ${c}50` : undefined }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Brush: {brushSize}px</label>
            <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={1} max={10} step={1} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Symmetry: {symmetry}-fold</label>
            <Slider value={[symmetry]} onValueChange={(v) => setSymmetry(v[0])} min={4} max={16} step={2} />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-border/30 bg-[#0a0a0a]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="cursor-crosshair w-full max-w-full h-auto"
            style={{ touchAction: "none" }}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleClear} variant="outline" className="gap-2 flex-1 active:scale-[0.97] transition-transform">
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
          <Button onClick={handleDownload} className="gap-2 flex-1 active:scale-[0.97] transition-transform">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
