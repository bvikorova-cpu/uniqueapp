import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DigitalMandala() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#8B5CF6");
  const [brushSize, setBrushSize] = useState(2);
  const [symmetry, setSymmetry] = useState(8);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;

    // Clear with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

      const rotatedX = localX * cos - localY * sin;
      const rotatedY = localX * sin + localY * cos;

      const finalX = rotatedX + centerX;
      const finalY = rotatedY + centerY;

      ctx.beginPath();
      ctx.arc(finalX, finalY, brushSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      drawSymmetricalPoint(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      drawSymmetricalPoint(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    toast({
      title: "Canvas cleared",
      description: "Start creating your new mandala",
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `mandala-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Mandala saved",
      description: "Your creation has been downloaded",
    });
  };

  const colors = [
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#EF4444", "#8B5CF6", "#6366F1"
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Digital Mandala Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-muted"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">
              Brush Size: {brushSize}px
            </label>
            <Slider
              value={[brushSize]}
              onValueChange={(v) => setBrushSize(v[0])}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">
              Symmetry: {symmetry}
            </label>
            <Slider
              value={[symmetry]}
              onValueChange={(v) => setSymmetry(v[0])}
              min={4}
              max={16}
              step={2}
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair w-full max-w-full h-auto"
            style={{ touchAction: "none" }}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleClear} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
